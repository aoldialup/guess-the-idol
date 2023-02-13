import { useState, useRef, useEffect } from "react";
import { Idol, Question, QUESTIONS_PER_GAME } from "./Idol";
import { getRandom, shuffle } from "./utils";
import data from './idols.json';
import songs from './songs.json';
import './App.css';
import ReactAudioPlayer from "react-audio-player";

const SKIPS_LIMIT = 7;

let idols: Idol[] = data;
let playlist = shuffle(songs);

function App() {
  const { current, advance, refreshQuestions } = useQuestions();
  const [song, setSong] = useState(0);

  const [score, setScore] = useState({
    correct: 0,
    wrong: 0,
    skipped: 0
  });

  const handleSongEnd = () => {
    if (song === playlist.length - 1) {
      setSong(0);
    }
    else {
      setSong((song) => song + 1);
    }
  }

  const CurrentSong = () => {
    return (
      <>

      </>
    )
  };

  if (!current) {
    return <div className="App">
      <CurrentSong />
      <h1>Game Over</h1>
      <Stats />
      <button onClick={() => playAgain()}>Play again</button>
    </div>
  }

  function playAgain() {
    setScore({ correct: 0, wrong: 0, skipped: 0 });
    playlist = shuffle(songs);
    setSong(0);
    refreshQuestions();
  }

  function submit(optionIndex: number) {
    if (current.options[optionIndex].id === current.correctId) {
      setScore({ ...score, correct: score.correct + 1 });
    }
    else {
      setScore({ ...score, wrong: score.wrong + 1 })
    }

    advance();
  }

  function handleSkip() {
    setScore({ ...score, skipped: score.skipped + 1 });
    advance();
  }

  function Stats() {
    return <div className="stats">
      <span><img className="test checkmark" src="icons/check.svg" alt="checkmark" /><span>{score.correct}</span></span>
      <span><img className="test x" src="icons/x.svg" alt="x" /><span>{score.wrong}</span></span>
      <span><img className="test skip" src="icons/chevron-double-right.svg" alt="" /><span>{score.skipped}</span></span>
    </div>;
  }

  return <div className="App">
    <h1>Guess the Idol</h1>
    <p>Now playing: {playlist[song].name}</p>
        <ReactAudioPlayer
          src={playlist[song].path}
          autoPlay
          controls
          onEnded={handleSongEnd}
        />
    <Stats />
    <div className="grid">
      <img className="idol" src={current.options.find(x => x.id === current.correctId)?.imageLinks[0]} alt="nobody" />
      <div className="options">
        {current.options.map((option: Idol, i: number) =>
          <button key={option.stageName} type="button" className="option" onClick={() => submit(i)}>
            {option.stageName}
          </button>
        )}
      </div>
    </div>
    <button className="skip-button" disabled={score.skipped === SKIPS_LIMIT} onClick={handleSkip}>Skip</button>
  </div>
}

const useQuestions = () => {
  const [current, setCurrent] = useState(0);
  const [questions, setQuestions] = useState(getQuestions());

  return {
    current: questions[current] ?? null,
    advance: () => setCurrent(current + 1),
    refreshQuestions: () => {
      setQuestions(getQuestions());
      setCurrent(0);
    }
  };
}

const getRandomIdol = (gender: string) => {
  const sameGender = idols.filter((i: Idol) => i.gender === gender);
  return sameGender[getRandom(0, sameGender.length)];
}

const getQuestions = () => {
  idols = shuffle(idols);
  const questions = new Map<string, Question>();

  while (questions.size < QUESTIONS_PER_GAME) {
    const correctIdol = getRandomIdol(getRandom(0, 2) === 0 ? "F" : "M");

    if (!questions.has(correctIdol.id)) {
      const options = new Set([correctIdol]);
      while (options.size < 4) {
        options.add(getRandomIdol(correctIdol.gender));
      }

      questions.set(correctIdol.id, {
        options: shuffle(Array.from(options)),
        correctId: correctIdol.id,
      });
    }
  }

  return [...questions.values()];
}

export default App;