
import { Form, Link, useLoaderData } from 'react-router';
import { fetchQuizzes } from '../api.js';
import { API_URL } from '../api-url.js';

/**
 * La liste de l'animateur : ses questionnaires. (Tous, en fait — les
 * comptes arrivent à la semaine 5.)
 *
 * Rendu CÔTÉ SERVEUR : le loader s'exécute sur le serveur, AVANT le rendu.
 */
export async function loader() {
  const response = await fetch(`${API_URL}/api/quizzes`);
  if (!response.ok) {
    throw new Error(`L'API répond ${response.status}.`);
  }
  return response.json();
}

/**
 * TODO (jalon ①) : l'action qui crée un questionnaire.
 *
 * React Router l'appelle quand le <Form method="post"> ci-dessous est
 * envoyé. Elle s'exécute sur le serveur, comme le loader.
 *
 * 1. Lire le formulaire : const formData = await request.formData();
 *    le titre est formData.get('title').
 * 2. Appeler POST /api/quizzes (adresse complète, ${API_URL}/api/quizzes),
 *    avec un corps JSON { title } et l'en-tête content-type.
 * 3. Si l'API répond 400, retourner l'erreur à la page :
 *    return data({ error: body.error }, { status: 400 });
 * 4. Sinon, envoyer l'auteur vers l'éditeur du nouveau questionnaire :
 *    return redirect(`/quizzes/${body.id}/edit`);
 *
 * Imports nécessaires : data et redirect, de 'react-router'.
 */

export default function Quizzes() {
  const quizzes = useLoaderData();

  return (
    <main className="screen">
      <h1>Mes questionnaires</h1>
      <ul className="quiz-list">
        {quizzes.map((quiz) => (
          <li key={quiz.id} className="card row">
            <div>
              <h2>
                <Link to={`/quizzes/${quiz.id}`}>{quiz.title}</Link>
              </h2>
              <p className="progress">{quiz.questionCount} questions</p>
            </div>
            <Link className="button" to={`/quizzes/${quiz.id}/edit`}>Modifier</Link>
          </li>
        ))}
      </ul>

      {/* Un formulaire HTML classique : method et action, comme au livre
          d'or. <Form> de React Router l'envoie à l'action de cette route
          sans recharger la page — et rejoue le loader ensuite. */}
      <Form method="post" className="card">
        <h2>Nouveau questionnaire</h2>
        <label>
          Titre
          <input name="title" placeholder="Titre du questionnaire" required />
        </label>
        {/* TODO (jalon ③) : afficher l'erreur renvoyée par l'action, s'il y en a une. */}
        <button>Créer</button>
      </Form>
    </main>
  );
}
