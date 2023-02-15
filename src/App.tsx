import { useState, useRef, useEffect } from "react";
import { Idol, Question, QUESTIONS_PER_GAME } from "./Idol";
import { getRandom, shuffle } from "./utils";
import data from './idols.json';
import songs from './songs.json';
import './App.css';
import ReactAudioPlayer from "react-audio-player";
import { useGroupSelection, GroupSelection } from "./useGroupSelection";

const SKIPS_LIMIT = 7;
const OPTIONS_PER_QUESTION = 4;

let idols: Idol[] = data;
let playlist = shuffle(songs);

function App() {
  const [song, setSong] = useState(0);
  const { current, advance, refreshQuestions, handleChange, handlePlay, imagesId, groupSelection, genQuestions } = useQuestions();

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

  if (!groupSelection.verified) {
    return <GroupSelection
      groupSelection={groupSelection}
      imagesId={imagesId}
      handleChange={handleChange}
      handlePlay={() => {
        handlePlay();
        genQuestions();
      }}
    />
  }

  if (!current) {
    return <div className="App">
      <h1 className="title">Game Over</h1>
      <Stats />
      <button className="button" onClick={() => playAgain()}>Play again</button>
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
      <span><img className="stat-icon stat-checkmark" src="icons/check.svg" alt="correct" /><span>{score.correct}</span></span>
      <span><img className="stat-icon stat-wrong" src="icons/x.svg" alt="x" /><span>{score.wrong}</span></span>
      <span><img className="stat-icon stat-skip" src="icons/chevron-double-right.svg" alt="" /><span>{score.skipped}</span></span>
    </div>;
  }

  return <>
    <h1 className="title">Guess the Idol</h1>
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
    <button className="button skip-button" disabled={score.skipped === SKIPS_LIMIT} onClick={handleSkip}>Skip</button>
  </>
}

const useQuestions = () => {
  const { reset, handlePlay, handleChange, imagesId, groupSelection } = useGroupSelection();
  const [current, setCurrent] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);

  return {
    current: questions[current] ?? null,
    advance: () => setCurrent(current + 1),
    handlePlay,
    handleChange,
    groupSelection,
    imagesId,
    genQuestions: () => setQuestions(() => getQuestions(groupSelection)),
    refreshQuestions: () => {
      setQuestions(() => getQuestions(groupSelection));
      setCurrent(0);
      reset();
    }
  };
}

const getRandomIdol = (groupSelection: GroupSelection) => {
  if (groupSelection.useBoys && groupSelection.useGirls) {
    return idols[getRandom(0, idols.length)];
  }
  else if (groupSelection.useGirls) {
    const sameGender = idols.filter((i: Idol) => i.gender === 'F');
    return sameGender[getRandom(0, sameGender.length)];
  }

  const sameGender = idols.filter((i: Idol) => i.gender === 'M');
  return sameGender[getRandom(0, sameGender.length)];
}

const getQuestions = (groupSelection: GroupSelection) => {
  idols = shuffle(idols);
  const questions = new Map<string, Question>();

  while (questions.size < QUESTIONS_PER_GAME) {
    const correctIdol = getRandomIdol(groupSelection);

    if (!questions.has(correctIdol.id)) {
      const options = new Set([correctIdol]);
      while (options.size < OPTIONS_PER_QUESTION) {
        options.add(getRandomIdol(groupSelection));
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