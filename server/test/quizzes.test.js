/**
 * Tests d'INTÉGRATION de l'espace auteur : on démarre l'API sur une base
 * temporaire et on lui parle en HTTP, comme le fait le client.
 *
 * Le premier test est fourni. Les test.todo sont le jalon 2 ; le dernier
 * (« un questionnaire sans question ») est le jalon 3 : il doit ÉCHOUER
 * avant que vous corrigiez la route POST /api/games.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startServer } from "./helpers.js";
import { ChildProcess } from "node:child_process";

let api;
before(async () => {
	api = await startServer();
});
after(() => api.close());

test("un titre vide est refusé (400)", async () => {
	const { status, data } = await api.request("POST", "/api/quizzes", { title: "   " });
	assert.equal(status, 400);
	assert.equal(typeof data.error, "string");
});

test("un titre valide crée le questionnaire (201)", async () => {
	const { status, data } = await api.request("POST", "/api/quizzes", { title: "Capitales" });
	assert.equal(status, 201);
	assert.equal(data.title, "Capitales");
	assert.equal(typeof data.id, "number");
});

// ── Jalon 2 ───────────────────────────────────────────────────────────────
test("une question sans bonne réponse est refusée (400)", async () => {
  const quiz = await api.request("POST", "/api/quizzes", { title: "Capitales" });
	const { status, data } = await api.request("POST", `/api/quizzes/${quiz.data.id}/questions`, {
		text: "Question TestS",
		durationSeconds: 45,
		choices: [{ id: 1, text: "oui" }, { id: 2, text: "non" }],
	});
  assert.equal(status, 400)
  assert.equal(typeof data.error, "string")
});

test("une question avec deux bonnes réponses est refusée (400)",  async () => {
  const quiz = await api.request("POST", "/api/quizzes", { title: "Capitales" });
	const { status, data } = await api.request("POST", `/api/quizzes/${quiz.data.id}/questions`, {
		text: "Question Test",
		durationSeconds: 45,
		choices: [{ id: 1, text: "oui", isCorrect: true }, { id: 2, text: "non", isCorrect: true }],
	});
  assert.equal(status, 400)
  assert.equal(typeof data.error, "string")
});

test("une question valide est ajoutée et apparaît dans GET /api/quizzes/:id",  async () => {
  const quiz = await api.request("POST", "/api/quizzes", { title: "Capitales" });
	const { status, data } = await api.request("POST", `/api/quizzes/${quiz.data.id}/questions`, {
		text: "Real Working Question Test",
		durationSeconds: 45,
		choices: [{ id: 1, text: "oui", isCorrect: true }, { id: 2, text: "non" }],
	});
  const quizWithQuestions = await api.request("GET", `/api/quizzes/${quiz.data.id}`);
  assert.equal(quizWithQuestions.data.questions.length, 1)
  assert.equal(quizWithQuestions.data.questions[0].text, "Real Working Question Test")

  assert.equal(status, 201)
});

// ── Jalon 3 : d'abord le test qui échoue, ensuite la correction ───────────

test("une partie sur un questionnaire sans question est refusée (400)",  async () => {
  const quiz = await api.request("POST", "/api/quizzes", { title: "Capitales" });
	const { status, data } = await api.request("POST", `/api/game`, { quizId: quiz.data.id });

  assert.equal(status, 400)
  assert.equal(typeof data.error, "string")
});
