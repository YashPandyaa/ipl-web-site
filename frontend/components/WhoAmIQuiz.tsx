'use client';

import React, { useState, useEffect } from 'react';
import { getQuizPlayers } from '../lib/api';
import PlayerSearch from './PlayerSearch';
import { Trophy, HelpCircle, Eye, ChevronRight, RefreshCw, Star, XCircle, CheckCircle, Award } from 'lucide-react';

interface QuizQuestion {
  correct_answer: string;
  hints: string[];
}

export default function WhoAmIQuiz() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleHints, setVisibleHints] = useState<number>(1);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'answered' | 'finished'>('idle');
  const [userGuess, setUserGuess] = useState('');
  const [guessesCount, setGuessesCount] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [summary, setSummary] = useState<{ correctCount: number; points: number }[]>([]);

  useEffect(() => {
    if (status === 'loading') {
      loadQuiz();
    }
  }, [status]);

  const loadQuiz = async () => {
    const data = await getQuizPlayers();
    if (data && data.length > 0) {
      setQuestions(data);
      setCurrentIndex(0);
      setVisibleHints(1);
      setScore(0);
      setGuessesCount(0);
      setIsCorrect(false);
      setSummary([]);
      setStatus('playing');
    } else {
      setStatus('idle');
    }
  };

  const handleStart = () => {
    setStatus('loading');
  };

  const handleNextHint = () => {
    if (visibleHints < 3) {
      setVisibleHints(prev => prev + 1);
    }
  };

  const checkAnswer = (guess: string) => {
    if (status !== 'playing') return;

    const answer = questions[currentIndex].correct_answer.trim().toLowerCase();
    const cleanGuess = guess.trim().toLowerCase();

    const isMatch = cleanGuess === answer || 
                    // Support partial/last name matches for convenience, e.g., "Kohli" for "Virat Kohli"
                    (answer.includes(cleanGuess) && cleanGuess.length > 4) ||
                    (cleanGuess.includes(answer) && answer.length > 4);

    setGuessesCount(prev => prev + 1);

    if (isMatch) {
      setIsCorrect(true);
      // Points allocation: Hint 1: 10 pts, Hint 2: 7 pts, Hint 3: 4 pts
      const pointsEarned = visibleHints === 1 ? 10 : visibleHints === 2 ? 7 : 4;
      setScore(prev => prev + pointsEarned);
      setSummary(prev => [...prev, { correctCount: 1, points: pointsEarned }]);
      setStatus('answered');
    } else {
      if (guessesCount >= 2) {
        // Exceeded 3 guesses (0, 1, 2)
        setIsCorrect(false);
        setSummary(prev => [...prev, { correctCount: 0, points: 0 }]);
        setStatus('answered');
      }
    }
  };

  const handleSelectPlayer = (player: { player: string }) => {
    setUserGuess(player.player);
    checkAnswer(player.player);
  };

  const handleGiveUp = () => {
    setIsCorrect(false);
    setSummary(prev => [...prev, { correctCount: 0, points: 0 }]);
    setStatus('answered');
  };

  const handleNextQuestion = () => {
    setUserGuess('');
    setGuessesCount(0);
    setIsCorrect(false);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setVisibleHints(1);
      setStatus('playing');
    } else {
      setStatus('finished');
    }
  };

  if (status === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark backdrop-blur-none dark:backdrop-blur-md max-w-xl mx-auto text-center my-8">
        <div className="p-4 bg-gold/10 rounded-full text-gold mb-4 animate-bounce">
          <HelpCircle className="w-12 h-12" />
        </div>
        <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">Who Am I? Trivia Guesser</h3>
        <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-6 max-w-md">
          Test your IPL knowledge! We will give you up to 3 stats-based hints about a notable cricketer. Can you guess who they are?
        </p>
        <div className="bg-base-light/80 dark:bg-base-dark/80 p-4 rounded-xl border border-border-light dark:border-border-dark text-left mb-6 w-full text-xs space-y-2 text-text-secondary-light dark:text-text-secondary-dark">
          <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">💡 Scoring Rules:</p>
          <div className="flex justify-between items-center">
            <span>Guess on Hint 1:</span>
            <span className="text-gold font-mono font-semibold">+10 Points</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Guess on Hint 2:</span>
            <span className="text-gold font-mono font-semibold">+7 Points</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Guess on Hint 3:</span>
            <span className="text-gold font-mono font-semibold">+4 Points</span>
          </div>
          <p className="text-[10px] text-text-secondary-light/75 dark:text-text-secondary-dark/75 pt-2 border-t border-border-light dark:border-border-dark">Note: You have maximum 3 attempts per question before the player is revealed.</p>
        </div>
        <button
          onClick={handleStart}
          className="px-8 py-3 bg-gold text-brand-dark hover:bg-gold-light font-semibold rounded-lg shadow-lg hover:shadow-gold/20 transition-all uppercase tracking-wider text-sm"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark backdrop-blur-none dark:backdrop-blur-md max-w-xl mx-auto my-8 min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mb-4"></div>
        <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">Compiling stats and fetching questions...</p>
      </div>
    );
  }

  if (status === 'finished') {
    const totalPossible = questions.length * 10;
    const correctCount = summary.filter(s => s.correctCount === 1).length;
    const percentage = Math.round((score / totalPossible) * 100);

    return (
      <div className="flex flex-col items-center p-8 bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark backdrop-blur-none dark:backdrop-blur-md max-w-xl mx-auto text-center my-8">
        <div className="p-4 bg-gold/10 rounded-full text-gold mb-4">
          <Trophy className="w-12 h-12" />
        </div>
        <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-1">Quiz Completed!</h3>
        <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-6">Let&apos;s see how well you know your IPL superstars.</p>

        <div className="grid grid-cols-2 gap-4 w-full mb-6">
          <div className="bg-base-light/80 dark:bg-base-dark/80 p-4 rounded-xl border border-border-light dark:border-border-dark">
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark block mb-1">Total Score</span>
            <span className="text-2xl font-bold text-gold font-mono">{score} <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">/ {totalPossible}</span></span>
          </div>
          <div className="bg-base-light/80 dark:bg-base-dark/80 p-4 rounded-xl border border-border-light dark:border-border-dark">
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark block mb-1">Accuracy</span>
            <span className="text-2xl font-bold text-gold font-mono">{correctCount} <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">/ {questions.length}</span></span>
          </div>
        </div>

        {/* Rating Message */}
        <div className="bg-base-light/40 dark:bg-base-dark/40 p-4 rounded-lg border border-border-light dark:border-border-dark w-full mb-6 text-sm text-text-primary-light dark:text-text-primary-dark">
          {percentage >= 80 ? (
            <p className="text-accent-green-light dark:text-accent-green-dark font-semibold">🏆 Legendary Analyst! You have absolute mastery over IPL history.</p>
          ) : percentage >= 50 ? (
            <p className="text-gold font-semibold">🌟 Smart Cricket Fan! Great knowledge of stats and career pathways.</p>
          ) : (
            <p className="text-text-secondary-light dark:text-text-secondary-dark">🏏 Keep watching! The IPL database holds many secrets. Retry to build your knowledge!</p>
          )}
        </div>

        <button
          onClick={handleStart}
          className="flex items-center gap-2 px-6 py-3 bg-base-light dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-text-primary-light dark:text-text-primary-dark font-semibold rounded-lg border border-border-light dark:border-border-dark transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Play Again</span>
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="flex flex-col bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark backdrop-blur-none dark:backdrop-blur-md max-w-xl mx-auto p-6 md:p-8 my-8 shadow-2xl relative overflow-hidden">
      {/* Top Banner Progress */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <div className="flex items-center gap-1.5 bg-gold/10 text-gold px-3 py-1 rounded-full text-xs font-semibold font-mono">
          <Star className="w-3.5 h-3.5 fill-gold" />
          <span>Score: {score}</span>
        </div>
      </div>

      {/* Hints display stack */}
      <div className="space-y-4 mb-6 min-h-[160px]">
        {/* Hint 1 */}
        <div className="bg-base-light/80 dark:bg-base-dark/80 p-4 rounded-xl border border-border-light dark:border-border-dark flex items-start gap-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gold/20 text-gold text-xs font-bold shrink-0 mt-0.5">1</span>
          <p className="text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark">{currentQuestion.hints[0]}</p>
        </div>

        {/* Hint 2 */}
        {visibleHints >= 2 ? (
          <div className="bg-base-light/80 dark:bg-base-dark/80 p-4 rounded-xl border border-border-light dark:border-border-dark flex items-start gap-3 animate-fadeIn">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gold/20 text-gold text-xs font-bold shrink-0 mt-0.5">2</span>
            <p className="text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark">{currentQuestion.hints[1]}</p>
          </div>
        ) : (
          <button
            onClick={handleNextHint}
            className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-border-light dark:border-border-dark hover:border-gold/40 rounded-xl bg-base-light/20 dark:bg-base-dark/20 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-xs text-text-secondary-light dark:text-text-secondary-dark hover:text-gold hover:dark:text-gold font-semibold"
          >
            <Eye className="w-4 h-4" />
            <span>Unlock Hint 2 (-3 points value)</span>
          </button>
        )}

        {/* Hint 3 */}
        {visibleHints >= 3 ? (
          <div className="bg-base-light/80 dark:bg-base-dark/80 p-4 rounded-xl border border-border-light dark:border-border-dark flex items-start gap-3 animate-fadeIn">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gold/20 text-gold text-xs font-bold shrink-0 mt-0.5">3</span>
            <p className="text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark">{currentQuestion.hints[2]}</p>
          </div>
        ) : (
          visibleHints >= 2 && (
            <button
              onClick={handleNextHint}
              className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-border-light dark:border-border-dark hover:border-gold/40 rounded-xl bg-base-light/20 dark:bg-base-dark/20 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-xs text-text-secondary-light dark:text-text-secondary-dark hover:text-gold hover:dark:text-gold font-semibold"
            >
              <Eye className="w-4 h-4" />
              <span>Unlock Hint 3 (-3 points value)</span>
            </button>
          )
        )}
      </div>

      {/* Answer Form / Status Reveal */}
      {status === 'playing' ? (
        <div className="space-y-4 pt-4 border-t border-border-light dark:border-border-dark">
          <label className="block text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
            Who is this player? (Attempts: {guessesCount} / 3)
          </label>
          <div className="flex flex-col gap-3">
            <PlayerSearch 
              onSelect={handleSelectPlayer} 
              placeholder="Search & select player name..."
            />
            
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
                Type and select name from autocomplete dropdown to guess.
              </span>
              <button
                onClick={handleGiveUp}
                className="text-xs font-semibold text-accent-red-light dark:text-accent-red-dark hover:text-accent-red-light/80 dark:hover:text-accent-red-dark/80 transition-colors uppercase"
              >
                Give Up / Skip
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-4 border-t border-border-light dark:border-border-dark space-y-4">
          <div className={`p-4 rounded-xl flex items-start gap-3 border ${
            isCorrect 
              ? 'bg-accent-green-light/10 dark:bg-accent-green-dark/10 border-accent-green-light/30 dark:border-accent-green-dark/30 text-accent-green-light dark:text-accent-green-dark' 
              : 'bg-accent-red-light/10 dark:bg-accent-red-dark/10 border-accent-red-light/30 dark:border-accent-red-dark/30 text-accent-red-light dark:text-accent-red-dark'
          }`}>
            {isCorrect ? (
              <CheckCircle className="w-6 h-6 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-bold text-base">
                {isCorrect ? 'Correct!' : 'Incorrect!'}
              </h4>
              <p className="text-sm mt-0.5 text-text-primary-light dark:text-text-primary-dark">
                The correct answer is <span className="font-bold text-text-primary-light dark:text-text-primary-dark">{currentQuestion.correct_answer}</span>.
              </p>
            </div>
          </div>

          <button
            onClick={handleNextQuestion}
            className="w-full flex items-center justify-center gap-1.5 py-3 bg-base-light dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-text-primary-light dark:text-text-primary-dark font-semibold rounded-lg border border-border-light dark:border-border-dark transition-colors uppercase text-sm tracking-wider"
          >
            <span>{currentIndex + 1 === questions.length ? 'Show Results' : 'Next Player'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
