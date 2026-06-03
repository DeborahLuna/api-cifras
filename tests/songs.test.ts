import request from "supertest";
import app from "../src/app";
import { SongRepository } from "../src/repositories/song.repository";
import { Song } from "../src/types/song";

jest.mock("../src/config/database", () => ({
  default: {},
  __esModule: true,
}));

jest.mock("../src/repositories/song.repository");

const mockSong: Song = {
  id: 1,
  title: "Música Teste 01",
  artist: "Artista Teste 01",
  key: "C",
  chords: "C C/G Am D",
  created_at: new Date("2024-01-01T00:00:00.000Z"),
  updated_at: new Date("2024-01-01T00:00:00.000Z"),
};

const mockSong2: Song = {
  id: 2,
  title: "Música Teste 02",
  artist: "Artista Teste 02",
  key: "E",
  chords: "E B C#m A",
  created_at: new Date("2024-01-02T00:00:00.000Z"),
  updated_at: new Date("2024-01-02T00:00:00.000Z"),
};

const MockedSongRepository = SongRepository as jest.MockedClass<
  typeof SongRepository
>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/songs", () => {
  it("should return all songs with status 200", async () => {
    MockedSongRepository.prototype.findAll.mockResolvedValue([
      mockSong,
      mockSong2,
    ]);

    const response = await request(app).get("/api/songs");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].title).toBe("Música Teste 01");
    expect(response.body[1].title).toBe("Música Teste 02");
  });

  it("should return empty array when no songs exist", async () => {
    MockedSongRepository.prototype.findAll.mockResolvedValue([]);

    const response = await request(app).get("/api/songs");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});

describe("GET /api/songs/:id", () => {
  it("should return a song by id with status 200", async () => {
    MockedSongRepository.prototype.findById.mockResolvedValue(mockSong);

    const response = await request(app).get("/api/songs/1");

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(1);
    expect(response.body.title).toBe("Música Teste 01");
    expect(response.body.artist).toBe("Artista Teste 01");
  });

  it("should return 404 when song is not found", async () => {
    MockedSongRepository.prototype.findById.mockResolvedValue(null);

    const response = await request(app).get("/api/songs/999");

    expect(response.status).toBe(404);
    expect(response.body.error).toContain("not found");
  });

  it("should return 400 for invalid id", async () => {
    const response = await request(app).get("/api/songs/abc");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid id parameter");
  });
});

describe("POST /api/songs", () => {
  it("should create a song and return status 201", async () => {
    MockedSongRepository.prototype.create.mockResolvedValue(mockSong);

    const payload = {
      title: "Música Teste 01",
      artist: "Artista Teste 01",
      key: "C",
      chords: "C C/G Am D",
    };

    const response = await request(app).post("/api/songs").send(payload);

    expect(response.status).toBe(201);
    expect(response.body.id).toBe(1);
    expect(response.body.title).toBe("Música Teste 01");
  });

  it("should return 400 when title is missing", async () => {
    const payload = { artist: "Artista Teste 01", key: "C", chords: "C C/G Am D" };

    const response = await request(app).post("/api/songs").send(payload);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('"title"');
  });

  it("should return 400 when artist is missing", async () => {
    const payload = { title: "Música Teste 01", key: "C", chords: "C C/G Am D" };

    const response = await request(app).post("/api/songs").send(payload);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('"artist"');
  });

  it("should return 400 when key is missing", async () => {
    const payload = { title: "Música Teste 01", artist: "Artista Teste 01", chords: "C C/G Am D" };

    const response = await request(app).post("/api/songs").send(payload);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('"key"');
  });

  it("should return 400 when chords is missing", async () => {
    const payload = { title: "Música Teste 01", artist: "Artista Teste 01", key: "C" };

    const response = await request(app).post("/api/songs").send(payload);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('"chords"');
  });
});

describe("PUT /api/songs/:id", () => {
  it("should update a song and return status 200", async () => {
    const updatedSong: Song = { ...mockSong, title: "Música Teste 01 (Acoustic)" };
    MockedSongRepository.prototype.findById.mockResolvedValue(mockSong);
    MockedSongRepository.prototype.update.mockResolvedValue(updatedSong);

    const response = await request(app)
      .put("/api/songs/1")
      .send({ title: "Música Teste 01 (Acoustic)" });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Música Teste 01 (Acoustic)");
  });

  it("should return 404 when song to update is not found", async () => {
    MockedSongRepository.prototype.findById.mockResolvedValue(null);

    const response = await request(app)
      .put("/api/songs/999")
      .send({ title: "New Title" });

    expect(response.status).toBe(404);
    expect(response.body.error).toContain("not found");
  });

  it("should return 400 when body is empty", async () => {
    const response = await request(app).put("/api/songs/1").send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("At least one field");
  });

  it("should return 400 for invalid id", async () => {
    const response = await request(app)
      .put("/api/songs/abc")
      .send({ title: "x" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid id parameter");
  });
});

describe("DELETE /api/songs/:id", () => {
  it("should delete a song and return status 204", async () => {
    MockedSongRepository.prototype.findById.mockResolvedValue(mockSong);
    MockedSongRepository.prototype.delete.mockResolvedValue(true);

    const response = await request(app).delete("/api/songs/1");

    expect(response.status).toBe(204);
  });

  it("should return 404 when song to delete is not found", async () => {
    MockedSongRepository.prototype.findById.mockResolvedValue(null);

    const response = await request(app).delete("/api/songs/999");

    expect(response.status).toBe(404);
    expect(response.body.error).toContain("not found");
  });

  it("should return 400 for invalid id", async () => {
    const response = await request(app).delete("/api/songs/abc");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid id parameter");
  });
});

describe("GET /health", () => {
  it("should return health status 200", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });
});
