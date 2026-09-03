import { Form, Link, useLoaderData } from 'react-router';
import { API_URL } from '../api-url.js';

/**
 * L'éditeur de questionnaire : ajouter des questions, en retirer. Créer et
 * modifier un questionnaire sans toucher à SQL, c'est la semaine 3.
 *
 * Deux exports pour React Router : le loader (lire le questionnaire, comme
 * quiz-details.jsx) et l'action (recevoir les formulaires de la page).
 */

/**
 * TODO (jalon ②, première partie) : le loader.
 *
 * Exactement celui de quiz-details.jsx : GET ${API_URL}/api/quizzes/:id,
 * 404 si le questionnaire n'existe pas, sinon le JSON.
 */
export async function loader({ params }) {
  throw new Response('À faire : le loader de l’éditeur.', { status: 501 });
}

/**
 * TODO (jalon ②, deuxième partie) : l'action qui ajoute une question.
 *
 * Le formulaire envoie : text, durationSeconds, choice1 à choice4 (texte de
 * chaque choix, possiblement vide) et correct (le numéro du bon choix, 1 à
 * 4, ou rien si aucun bouton radio n'est coché).
 *
 * 1. Lire le formulaire : const formData = await request.formData().
 * 2. Construire le tableau des choix, en ignorant les champs vides :
 *      const choices = [1, 2, 3, 4]
 *        .map((n) => ({ text: formData.get(`choice${n}`) ?? '',
 *                       isCorrect: formData.get('correct') === String(n) }))
 *        .filter((c) => c.text.trim() !== '');
 * 3. Appeler POST ${API_URL}/api/quizzes/${params.id}/questions avec le
 *    corps JSON { text, durationSeconds: Number(...), choices }.
 * 4. Si l'API répond 400 : return data({ error: body.error }, { status: 400 }).
 * 5. Sinon : return { added: true }. Pas de redirection : React Router
 *    rejoue le loader, et la nouvelle question apparaît dans la page.
 *
 * TODO (jalon ④) : le même formulaire de page peut porter
 * plusieurs boutons. Un champ caché « intent » dit lequel a été pressé :
 * 'add' (ajouter) ou 'delete' (retirer la question formData.get('questionId'),
 * par DELETE ${API_URL}/api/quizzes/${params.id}/questions/${questionId}).
 */

export default function QuizEdit() {
  const quiz = useLoaderData();
  // TODO (jalon ③) : const actionData = useActionData(); puis afficher
  // actionData?.error dans un <p className="error">.

  return (
    <main className="screen">
      <h1>{quiz.title}</h1>
      <p>
        <Link to="/quizzes">← Mes questionnaires</Link>
        {' · '}
        <Link to={`/quizzes/${quiz.id}`}>Voir le questionnaire</Link>
      </p>

      {quiz.questions.map((question, i) => (
        <section key={question.id} className="card question row">
          <div>
            <h2>
              {i + 1}. {question.text}
            </h2>
            <p className="progress">
              {question.durationSeconds} secondes · {question.choices.length} choix
            </p>
          </div>
          {/* TODO (jalon ④) : un <Form method="post"> avec
              intent=delete et questionId, et un bouton Retirer. */}
        </section>
      ))}

      {/* key : quand le nombre de questions change, React remonte le
          formulaire, donc le vide. Une nouvelle question, un formulaire neuf. */}
      <Form method="post" className="card" key={quiz.questions.length}>
        <h2>Nouvelle question</h2>
        <input type="hidden" name="intent" value="add" />
        <label>
          Question
          <input name="text" placeholder="Texte de la question" required />
        </label>
        <label>
          Durée (secondes)
          <input name="durationSeconds" type="number" min="5" max="60" defaultValue="20" required />
        </label>
        <fieldset className="choices-edit">
          <legend>Choix de réponse (cochez la bonne)</legend>
          {[1, 2, 3, 4].map((n) => (
            <label key={n} className="choice-edit">
              <input type="radio" name="correct" value={n} />
              <input name={`choice${n}`} placeholder={`Choix ${n}`} required={n <= 2} />
            </label>
          ))}
        </fieldset>
        <button>Ajouter la question</button>
      </Form>
    </main>
  );
}
