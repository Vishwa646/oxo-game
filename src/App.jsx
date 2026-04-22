import React, { useState, useEffect, useCallback } from 'react';
import { checkWinner, getBestMove, WINNING_LINES } from './gameLogic';

const INITIAL_SCORES = { X: 0, O: 0, draw: 0 };

function Cell({ value, index, onClick, isWinning, disabled }) {
  return (
    <button
      onClick={() => onClick(index)}
      disabled={disabled || !!value}
      style={{
        width: '100%',
        aspectRatio: '1',
        background: isWinning ? 'rgba(0,255,65,0.12)' : 'rgba(0,255,65,0.03)',
        border: isWinning
          ? '2px solid var(--green)'
          : '2px solid rgba(0,255,65,0.25)',
        borderRadius: '4px',
        cursor: value || disabled ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'clamp(2rem, 8vw, 4rem)',
        fontFamily: 'var(--font-display)',
        fontWeight: 900,
        color: value === 'X' ? 'var(--amber)' : 'var(--green)',
        textShadow: value === 'X'
          ? '0 0 10px var(--amber), 0 0 30px rgba(255,179,0,0.5)'
          : '0 0 10px var(--green), 0 0 30px var(--green-glow)',
        transition: 'all 0.15s ease',
        animation: isWinning ? 'win-flash 0.8s ease infinite' : 'none',
        boxShadow: isWinning
          ? '0 0 15px var(--green-glow), inset 0 0 10px var(--green-glow)'
          : value
          ? 'inset 0 0 8px rgba(0,255,65,0.1)'
          : 'none',
      }}
      onMouseEnter={e => {
        if (!value && !disabled) {
          e.currentTarget.style.background = 'rgba(0,255,65,0.08)';
          e.currentTarget.style.borderColor = 'var(--green-dim)';
        }
      }}
      onMouseLeave={e => {
        if (!value && !disabled) {
          e.currentTarget.style.background = 'rgba(0,255,65,0.03)';
          e.currentTarget.style.borderColor = 'rgba(0,255,65,0.25)';
        }
      }}
    >
      {value}
    </button>
  );
}

function ScoreBox({ label, value, active }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '12px 20px',
      border: `1px solid ${active ? 'var(--green)' : 'rgba(0,255,65,0.2)'}`,
      borderRadius: '4px',
      background: active ? 'rgba(0,255,65,0.07)' : 'transparent',
      boxShadow: active ? '0 0 15px var(--green-glow)' : 'none',
      transition: 'all 0.3s ease',
      minWidth: '80px',
    }}>
      <div style={{
        fontSize: '0.65rem',
        letterSpacing: '0.2em',
        color: 'var(--green-dim)',
        marginBottom: '4px',
      }}>{label}</div>
      <div style={{
        fontSize: '1.8rem',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        color: active ? 'var(--green)' : 'var(--green-dim)',
        textShadow: active ? '0 0 10px var(--green-glow)' : 'none',
      }}>{value}</div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState(null); // null = menu, 'pvp' | 'pvc'
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [result, setResult] = useState(null); // { winner, line }
  const [scores, setScores] = useState(INITIAL_SCORES);
  const [aiThinking, setAiThinking] = useState(false);
  const [moveCount, setMoveCount] = useState(0);

  const winningLine = result?.line || [];

  const makeMove = useCallback((index, boardState, player) => {
    if (boardState[index] || result) return null;
    const newBoard = [...boardState];
    newBoard[index] = player;
    return newBoard;
  }, [result]);

  const handleCellClick = (index) => {
    if (board[index] || result || aiThinking) return;
    if (mode === 'pvc' && currentPlayer === 'O') return;

    const newBoard = makeMove(index, board, currentPlayer);
    if (!newBoard) return;

    const gameResult = checkWinner(newBoard);
    setBoard(newBoard);
    setMoveCount(c => c + 1);

    if (gameResult) {
      setResult(gameResult);
      setScores(s => ({
        ...s,
        [gameResult.winner]: s[gameResult.winner] + 1,
      }));
    } else {
      setCurrentPlayer(p => p === 'X' ? 'O' : 'X');
    }
  };

  // AI move
  useEffect(() => {
    if (mode !== 'pvc' || currentPlayer !== 'O' || result) return;
    setAiThinking(true);
    const timer = setTimeout(() => {
      const newBoard = [...board];
      const move = getBestMove(newBoard);
      if (move !== -1) {
        newBoard[move] = 'O';
        const gameResult = checkWinner(newBoard);
        setBoard(newBoard);
        setMoveCount(c => c + 1);
        if (gameResult) {
          setResult(gameResult);
          setScores(s => ({
            ...s,
            [gameResult.winner]: s[gameResult.winner] + 1,
          }));
        } else {
          setCurrentPlayer('X');
        }
      }
      setAiThinking(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [currentPlayer, mode, result]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setResult(null);
    setAiThinking(false);
    setMoveCount(0);
  };

  const goToMenu = () => {
    setMode(null);
    resetGame();
    setScores(INITIAL_SCORES);
  };

  const statusText = () => {
    if (aiThinking) return '[ AI COMPUTING... ]';
    if (!result) {
      const who = mode === 'pvc'
        ? currentPlayer === 'X' ? 'YOUR TURN' : 'AI TURN'
        : `PLAYER ${currentPlayer} TURN`;
      return `> ${who}`;
    }
    if (result.winner === 'draw') return '[ DRAW — NO WINNER ]';
    if (mode === 'pvc') return result.winner === 'X' ? '[ YOU WIN! ]' : '[ AI WINS ]';
    return `[ PLAYER ${result.winner} WINS! ]`;
  };

  const statusColor = () => {
    if (!result) return aiThinking ? 'var(--green-dim)' : 'var(--green)';
    if (result.winner === 'draw') return 'var(--amber)';
    if (mode === 'pvc') return result.winner === 'X' ? 'var(--green)' : 'var(--red)';
    return result.winner === 'X' ? 'var(--amber)' : 'var(--green)';
  };

  // --- MENU SCREEN ---
  if (!mode) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'flicker 8s infinite',
      }}>
        {/* ASCII art header */}
        <pre style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(0.35rem, 1.5vw, 0.75rem)',
          color: 'var(--green)',
          textShadow: '0 0 8px var(--green-glow)',
          lineHeight: 1.2,
          marginBottom: '10px',
          textAlign: 'center',
          animation: 'pulse-green 3s ease infinite',
        }}>{`
 ██████╗ ██╗  ██╗ ██████╗ 
██╔═══██╗╚██╗██╔╝██╔═══██╗
██║   ██║ ╚███╔╝ ██║   ██║
██║   ██║ ██╔██╗ ██║   ██║
╚██████╔╝██╔╝ ██╗╚██████╔╝
 ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ 
        `}</pre>

        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(0.6rem, 2vw, 0.85rem)',
          letterSpacing: '0.5em',
          color: 'var(--green-dim)',
          marginBottom: '50px',
        }}>TIC · TAC · TOE · v1.0</div>

        <div style={{
          border: '1px solid rgba(0,255,65,0.3)',
          padding: '40px',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '100%',
          maxWidth: '320px',
          background: 'rgba(0,255,65,0.02)',
        }}>
          <div style={{
            fontSize: '0.7rem',
            letterSpacing: '0.2em',
            color: 'var(--green-dim)',
            marginBottom: '8px',
          }}>SELECT MODE:</div>

          {[
            { id: 'pvp', label: '[ 2 PLAYERS ]', sub: 'Player vs Player' },
            { id: 'pvc', label: '[ VS COMPUTER ]', sub: 'Player vs AI (Minimax)' },
          ].map(({ id, label, sub }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              style={{
                background: 'transparent',
                border: '1px solid var(--green)',
                color: 'var(--green)',
                fontFamily: 'var(--font-display)',
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                padding: '16px',
                borderRadius: '3px',
                transition: 'all 0.2s',
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(0,255,65,0.1)';
                e.currentTarget.style.boxShadow = '0 0 20px var(--green-glow)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {label}
              <div style={{ fontSize: '0.65rem', color: 'var(--green-dim)', marginTop: '4px', fontFamily: 'var(--font-mono)', fontWeight: 400 }}>{sub}</div>
            </button>
          ))}
        </div>

        <div style={{
          marginTop: '40px',
          fontSize: '0.65rem',
          color: 'rgba(0,255,65,0.3)',
          letterSpacing: '0.15em',
          animation: 'blink 1.5s step-end infinite',
        }}>INSERT COIN ▮</div>
      </div>
    );
  }

  // --- GAME SCREEN ---
  const xLabel = 'PLAYER X';
  const oLabel = mode === 'pvc' ? 'AI (O)' : 'PLAYER O';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.4s ease',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button
          onClick={goToMenu}
          style={{
            background: 'transparent',
            border: '1px solid rgba(0,255,65,0.3)',
            color: 'var(--green-dim)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            padding: '6px 12px',
            borderRadius: '3px',
            letterSpacing: '0.1em',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,255,65,0.3)'}
        >← MENU</button>

        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(0.9rem, 3vw, 1.3rem)',
          fontWeight: 900,
          letterSpacing: '0.3em',
          color: 'var(--green)',
          textShadow: '0 0 10px var(--green-glow)',
        }}>OXO</div>

        <div style={{
          fontSize: '0.65rem',
          color: 'rgba(0,255,65,0.4)',
          letterSpacing: '0.1em',
          border: '1px solid rgba(0,255,65,0.2)',
          padding: '4px 8px',
          borderRadius: '2px',
        }}>{mode === 'pvp' ? 'PVP' : 'PVC'}</div>
      </div>

      {/* Scoreboard */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
        <ScoreBox label={xLabel} value={scores.X} active={!result && currentPlayer === 'X'} />
        <div style={{ color: 'rgba(0,255,65,0.3)', fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>VS</div>
        <ScoreBox label={oLabel} value={scores.O} active={!result && currentPlayer === 'O'} />
        <div style={{ color: 'rgba(0,255,65,0.2)', fontSize: '0.6rem', marginLeft: '8px' }}>
          <div style={{ letterSpacing: '0.1em' }}>DRAWS</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', textAlign: 'center' }}>{scores.draw}</div>
        </div>
      </div>

      {/* Status */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'clamp(0.75rem, 2.5vw, 0.9rem)',
        color: statusColor(),
        letterSpacing: '0.15em',
        marginBottom: '20px',
        minHeight: '24px',
        textShadow: result ? `0 0 10px ${statusColor()}` : 'none',
        animation: result && result.winner !== 'draw' ? 'pulse-green 1s ease infinite' : 'none',
      }}>
        {statusText()}
        {!result && <span style={{ animation: 'blink 1s step-end infinite' }}>▮</span>}
      </div>

      {/* Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        width: '100%',
        maxWidth: '340px',
        marginBottom: '24px',
      }}>
        {board.map((cell, i) => (
          <Cell
            key={i}
            value={cell}
            index={i}
            onClick={handleCellClick}
            isWinning={winningLine.includes(i)}
            disabled={!!result || aiThinking}
          />
        ))}
      </div>

      {/* Move counter */}
      <div style={{
        fontSize: '0.65rem',
        color: 'rgba(0,255,65,0.3)',
        letterSpacing: '0.15em',
        marginBottom: '20px',
      }}>MOVES: {moveCount.toString().padStart(2, '0')}</div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={resetGame}
          style={{
            background: 'transparent',
            border: '1px solid var(--green)',
            color: 'var(--green)',
            fontFamily: 'var(--font-display)',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            padding: '10px 24px',
            borderRadius: '3px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(0,255,65,0.1)';
            e.currentTarget.style.boxShadow = '0 0 15px var(--green-glow)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >[ NEW GAME ]</button>
      </div>

      {/* Footer */}
      <div style={{
        position: 'fixed',
        bottom: '12px',
        fontSize: '0.55rem',
        color: 'rgba(0,255,65,0.2)',
        letterSpacing: '0.15em',
      }}>SYSTEM READY ● AI: MINIMAX ALGORITHM</div>
    </div>
  );
}
