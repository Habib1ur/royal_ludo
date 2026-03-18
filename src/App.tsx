import { Crown, Expand, History, Minimize, RotateCcw, ScrollText, Sparkles, Undo2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Board } from './components/Board';
import { ControlPanel } from './components/ControlPanel';
import { Dice } from './components/Dice';
import { Modal } from './components/Modal';
import { MoveHistory } from './components/MoveHistory';
import { PlayerPanel } from './components/PlayerPanel';
import { RulesDialog } from './components/RulesDialog';
import { StartScreen } from './components/StartScreen';
import { StatsPanel } from './components/StatsPanel';
import { WinnerDialog } from './components/WinnerDialog';
import { PLAYER_ORDER } from './constants/players';
import { useSoundHooks } from './hooks/useSoundHooks';
import { useGameStore } from './store/useGameStore';
import { Token } from './types/game';
import { getCaptureCandidates } from './utils/board';

function App() {
  const {
    phase,
    lobby,
    players,
    tokens,
    currentTurnIndex,
    diceValue,
    diceRolling,
    selectableTokenIds,
    winner,
    moveHistory,
    notifications,
    showRules,
    showResetConfirm,
    canResumeSavedGame,
    theme,
    options,
    stats,
    undoStack,
    lastActionAt,
    setLobbyPlayerCount,
    updateLobbyPlayer,
    updateLobbyOptions,
    startGame,
    resumeSavedGame,
    rollDice,
    useManualDice,
    moveToken,
    advanceTurn,
    undoLastTurn,
    dismissToast,
    openRules,
    closeRules,
    openResetConfirm,
    closeResetConfirm,
    resetToLobby,
    clearSavedGame,
    setTheme,
  } = useGameStore();

  const sounds = useSoundHooks(options.soundsEnabled);
  const boardViewportRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false,
  );
  const [diceDragOffset, setDiceDragOffset] = useState({ x: 0, y: 0 });
  const [boardScale, setBoardScale] = useState(1);
  const [timerRemaining, setTimerRemaining] = useState<number>(options.turnTimerSeconds);
  const enabledPlayers = players.filter((player) => player.enabled);
  const currentPlayer = enabledPlayers[currentTurnIndex];
  const isPerformance = options.performanceMode !== 'off';
  const isUltraPerformance = options.performanceMode === 'ultra';
  const playersEnabledMap = Object.fromEntries(players.map((player) => [player.color, player.enabled])) as Record<
    typeof players[number]['color'],
    boolean
  >;



  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleChange = (event: MediaQueryListEvent) => setIsMobileViewport(event.matches);
    setIsMobileViewport(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    const handleFullscreen = async () => {
      const active = document.fullscreenElement === boardViewportRef.current;
      setIsFullscreen(active);

      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      if (!isMobile || typeof screen === 'undefined' || !('orientation' in screen)) {
        return;
      }

      try {
        const orientationApi = screen.orientation as ScreenOrientation & {
          lock?: (orientation: 'landscape' | 'portrait') => Promise<void>;
          unlock?: () => void;
        };

        if (active && orientationApi.lock) {
          await orientationApi.lock('landscape');
        } else if (!active && orientationApi.unlock) {
          orientationApi.unlock();
        }
      } catch {
        // Ignore unsupported orientation locks.
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreen);
    return () => document.removeEventListener('fullscreenchange', handleFullscreen);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('vibrate' in navigator)) {
      return;
    }

    if (winner) {
      navigator.vibrate([120, 80, 180]);
    }
  }, [winner]);

  useEffect(() => {
    if (isUltraPerformance) {
      setDiceDragOffset({ x: 0, y: 0 });
      return;
    }

    setDiceDragOffset({ x: 0, y: 0 });
  }, [currentPlayer?.color, isFullscreen, isUltraPerformance]);

  useEffect(() => {
    if (isUltraPerformance || !isFullscreen || phase !== 'playing') {
      return;
    }

    if (!diceRolling && diceValue === null) {
      setDiceDragOffset({ x: 0, y: 0 });
    }
  }, [diceRolling, diceValue, isFullscreen, phase, currentTurnIndex, currentPlayer?.color, isUltraPerformance]);


  const toggleFullscreen = async () => {
    if (!boardViewportRef.current) return;
    if (document.fullscreenElement === boardViewportRef.current) {
      await document.exitFullscreen();
      return;
    }
    await boardViewportRef.current.requestFullscreen();
  };

  const fullscreenDiceAnchor = (() => {
    const dieSize = isMobileViewport ? 64 : 80;
    const half = dieSize / 2;

    if (isUltraPerformance) {
      switch (currentPlayer?.color) {
        case 'red':
          return { left: `calc(20% - ${half}px)`, top: `calc(7.5% - ${half}px)` };
        case 'green':
          return { left: `calc(80% - ${half}px)`, top: `calc(7.5% - ${half}px)` };
        case 'yellow':
          return { left: `calc(80% - ${half}px)`, top: `calc(92.5% - ${half}px)` };
        case 'blue':
          return { left: `calc(20% - ${half}px)`, top: `calc(92.5% - ${half}px)` };
        default:
          return { left: `calc(20% - ${half}px)`, top: `calc(7.5% - ${half}px)` };
      }
    }

    switch (currentPlayer?.color) {
      case 'red':
        return { left: `calc(20% - ${half}px)`, top: `calc(20% - ${half}px)` };
      case 'green':
        return { left: `calc(80% - ${half}px)`, top: `calc(20% - ${half}px)` };
      case 'yellow':
        return { left: `calc(80% - ${half}px)`, top: `calc(80% - ${half}px)` };
      case 'blue':
        return { left: `calc(20% - ${half}px)`, top: `calc(80% - ${half}px)` };
      default:
        return { left: `calc(20% - ${half}px)`, top: `calc(20% - ${half}px)` };
    }
  })();

  const clampDiceOffset = (offset: { x: number; y: number }) => {
    const boardEl = boardViewportRef.current;
    if (!boardEl || isUltraPerformance) {
      return isUltraPerformance ? { x: 0, y: 0 } : offset;
    }

    const rect = boardEl.getBoundingClientRect();
    const dieSize = isMobileViewport ? 64 : 80;
    const padding = 16;
    const anchorPercentX = currentPlayer?.color === 'green' || currentPlayer?.color === 'yellow' ? 0.8 : 0.2;
    const anchorPercentY = currentPlayer?.color === 'yellow' || currentPlayer?.color === 'blue' ? 0.8 : 0.2;
    const anchorX = anchorPercentX * rect.width;
    const anchorY = anchorPercentY * rect.height;
    const minX = padding + dieSize / 2 - anchorX;
    const maxX = rect.width - padding - dieSize / 2 - anchorX;
    const minY = padding + dieSize / 2 - anchorY;
    const maxY = rect.height - padding - dieSize / 2 - anchorY;

    return {
      x: Math.max(minX, Math.min(maxX, offset.x)),
      y: Math.max(minY, Math.min(maxY, offset.y)),
    };
  };

  const pickAiMove = useMemo(() => {
    return (candidateIds: string[], dieValue: number | null) => {
      if (!dieValue) return null;
      const candidates = candidateIds
        .map((id) => tokens.find((token) => token.id === id))
        .filter((token): token is Token => Boolean(token));

      const scored = candidates.map((token) => {
        const projected = token.state === 'home' ? 0 : (token.progress ?? 0) + dieValue;
        const simulated = token.state === 'home'
          ? { ...token, state: 'active' as const, progress: 0 }
          : { ...token, progress: projected, state: projected >= 57 ? 'finished' as const : 'active' as const };
        const captures = getCaptureCandidates(simulated, tokens).length;
        const score =
          projected +
          captures * 18 +
          (projected >= 57 ? 30 : 0) +
          (token.state === 'home' ? 8 : 0) +
          (dieValue === 6 ? 4 : 0);
        return { token, score };
      });

      return scored.sort((a, b) => b.score - a.score)[0]?.token.id ?? null;
    };
  }, [tokens]);

  useEffect(() => {
    if (phase !== 'playing' || !currentPlayer || currentPlayer.kind !== 'ai' || winner) {
      return;
    }

    const timer = window.setTimeout(async () => {
      const latest = useGameStore.getState();
      const latestCurrent = latest.players.filter((player) => player.enabled)[latest.currentTurnIndex];
      if (!latestCurrent || latestCurrent.kind !== 'ai' || latest.winner || latest.phase !== 'playing') {
        return;
      }

      if (latest.diceValue === null && !latest.diceRolling) {
        await latest.rollDice();
        return;
      }

      if (latest.diceValue !== null && latest.selectableTokenIds.length > 0) {
        const choice = pickAiMove(latest.selectableTokenIds, latest.diceValue);
        if (choice) {
          await latest.moveToken(choice);
        }
      }
    }, latestDelay(options.performanceMode, currentPlayer.kind));

    return () => window.clearTimeout(timer);
  }, [currentPlayer, diceRolling, diceValue, options.performanceMode, phase, pickAiMove, selectableTokenIds, winner]);

  useEffect(() => {
    if (phase !== 'playing' || winner || options.turnTimerSeconds === 0) {
      setTimerRemaining(options.turnTimerSeconds);
      return;
    }

    setTimerRemaining(options.turnTimerSeconds);
    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, options.turnTimerSeconds - elapsed);
      setTimerRemaining(remaining);
      if (remaining === 0) {
        window.clearInterval(interval);
        const latest = useGameStore.getState();
        if (latest.phase !== 'playing' || latest.winner) return;
        if (latest.diceValue === null && !latest.diceRolling) {
          void latest.rollDice();
          return;
        }
        if (latest.diceValue !== null && latest.selectableTokenIds.length > 0) {
          const choice = latest.players.filter((player) => player.enabled)[latest.currentTurnIndex]?.kind === 'ai'
            ? pickAiMove(latest.selectableTokenIds, latest.diceValue)
            : latest.selectableTokenIds[0];
          if (choice) void latest.moveToken(choice);
          return;
        }
        latest.advanceTurn();
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, [currentTurnIndex, lastActionAt, options.turnTimerSeconds, phase, pickAiMove, winner]);

  const handleRoll = async () => {
    sounds.playDice();
    await rollDice();
  };

  const handleMoveToken = async (tokenId: string) => {
    const previous = useGameStore.getState().tokens;
    await moveToken(tokenId);
    const next = useGameStore.getState();
    const captured = next.tokens.some((token, index) => {
      const before = previous[index];
      return before && before.owner === token.owner && before.state !== 'home' && token.state === 'home';
    });

    if (next.winner) {
      sounds.playWin();
    } else if (captured) {
      sounds.playCapture();
      if ('vibrate' in navigator) navigator.vibrate(90);
    } else {
      if ('vibrate' in navigator) navigator.vibrate(25);
    }
  };

  if (phase === 'setup') {
    return (
      <>
        <StartScreen
          playerCount={lobby.playerCount}
          players={lobby.players}
          options={lobby.options}
          canResume={canResumeSavedGame}
          onPlayerCountChange={setLobbyPlayerCount}
          onPlayerChange={updateLobbyPlayer}
          onOptionsChange={updateLobbyOptions}
          onStart={() => startGame({ playerCount: lobby.playerCount, players: lobby.players, options: lobby.options })}
          onResume={resumeSavedGame}
          onClearSaved={clearSavedGame}
        />
      </>
    );
  }

  return (
    <div
      className={`${isPerformance ? 'performance-ui ' : ''}${isUltraPerformance ? 'performance-ui-2 ' : ''}${isPerformance && isMobileViewport ? 'mobile-performance ' : ''}min-h-screen overflow-hidden transition-colors ${
        theme === 'dark'
          ? 'bg-[radial-gradient(circle_at_top,#17326f_0%,#08101d_40%,#030712_100%)] text-white'
          : 'bg-[radial-gradient(circle_at_top,#f8fbff_0%,#dbeafe_38%,#eff6ff_100%)] text-slate-950'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-45 [background:radial-gradient(circle_at_20%_15%,rgba(239,68,68,0.18),transparent_18%),radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.14),transparent_16%),radial-gradient(circle_at_78%_80%,rgba(250,204,21,0.16),transparent_16%),radial-gradient(circle_at_18%_78%,rgba(59,130,246,0.16),transparent_16%)]" />

      <div className="relative flex min-h-screen flex-col p-2 sm:p-4 lg:p-5">
        {!isFullscreen ? (
          <header className={`mb-2 flex flex-wrap items-center justify-between gap-2 rounded-[1.4rem] border border-white/15 bg-white/10 px-3 py-3 shadow-glass ${isPerformance ? '' : 'backdrop-blur-xl'} sm:mb-3 sm:gap-3 sm:rounded-[1.8rem] sm:px-4`}>
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-300 sm:text-xs">Royal Ludo</p>
              <h1 className="font-display text-lg font-bold sm:text-2xl">Board match</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs sm:px-4 sm:text-sm">
                <Crown className="h-4 w-4" />
                {winner ? `${players.find((player) => player.color === winner)?.name} won` : `${currentPlayer?.name} to play`}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs sm:px-4 sm:text-sm">
                <Sparkles className="h-4 w-4" />
                {options.turnTimerSeconds === 0 ? 'Timer off' : `${timerRemaining}s left`}
              </div>
              <button type="button" onClick={openRules} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs transition hover:bg-white/10 sm:px-4 sm:text-sm">
                <ScrollText className="h-4 w-4" />
                <span className="hidden sm:inline">Rules</span>
              </button>
              <button type="button" onClick={undoLastTurn} disabled={undoStack.length === 0} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm">
                <Undo2 className="h-4 w-4" />
                <span className="hidden sm:inline">Undo</span>
              </button>
              <button type="button" onClick={toggleFullscreen} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs transition hover:bg-white/10 sm:px-4 sm:text-sm">
                <Expand className="h-4 w-4" />
                <span className="hidden sm:inline">Full screen</span>
              </button>
              <button type="button" onClick={openResetConfirm} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs transition hover:bg-white/10 sm:px-4 sm:text-sm">
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">New match</span>
              </button>
            </div>
          </header>
        ) : null}

        <main className={`grid min-h-0 flex-1 gap-2 sm:gap-3 ${isFullscreen ? 'grid-cols-1' : 'xl:grid-cols-[18rem_minmax(0,1fr)_19rem]'}`}>
          {!isFullscreen ? (
            <aside className="hidden xl:grid xl:auto-rows-max xl:gap-3">
              <div className="relative z-30">
                <Dice value={diceValue} rolling={diceRolling} disabled={diceRolling || diceValue !== null || phase === 'finished' || currentPlayer?.kind === 'ai'} manualMode={options.manualDiceInput && currentPlayer?.kind !== 'ai'} performanceMode={options.performanceMode} onRoll={handleRoll} onManualSubmit={useManualDice} />
              </div>
            </aside>
          ) : null}

          <section className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-2 sm:gap-3">
            <div ref={boardViewportRef} className={`relative min-h-0 rounded-[1.6rem] border border-white/15 bg-white/8 p-2 shadow-glass ${isPerformance && !isFullscreen ? '' : 'backdrop-blur-xl'} sm:rounded-[2.2rem] sm:p-3 ${isFullscreen ? 'h-screen w-screen overflow-hidden rounded-none border-0 bg-[radial-gradient(circle_at_top,#17326f_0%,#08101d_46%,#030712_100%)] p-2 sm:p-3' : ''}`}>
              <div className={`mx-auto h-full overflow-auto ${isFullscreen ? 'w-full max-w-none touch-pan-x touch-pan-y' : 'min-h-[22rem] w-full max-w-[min(98vw,1120px)] sm:min-h-[26rem] xl:max-h-[calc(100vh-11rem)]'}`}>
                <div className="flex h-full min-w-max items-center justify-center transition-transform duration-200" style={{ transform: `scale(${boardScale})`, transformOrigin: 'center center' }}>
                  <Board tokens={tokens} playersEnabled={playersEnabledMap} selectableTokenIds={selectableTokenIds} activePlayerColor={currentPlayer?.color} onTokenSelect={handleMoveToken} onStepSound={sounds.playStep} compactMode={!isFullscreen} performanceMode={options.performanceMode} />
                </div>
              </div>

              {!isFullscreen ? (
                <div className="pointer-events-none absolute left-3 top-3 z-40 hidden rounded-full border border-white/45 bg-white/88 px-3 py-2 text-[10px] uppercase tracking-[0.35em] text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.18)] backdrop-blur-sm lg:block">
                  Safe stars mark protected cells
                </div>
              ) : null}

              <button type="button" onClick={toggleFullscreen} className="absolute right-3 top-3 z-40 inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/90 px-3 py-2 text-xs font-medium text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.2)] transition hover:bg-white sm:right-4 sm:top-4 sm:px-4 sm:text-sm">
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
                <span className="hidden md:inline">{isFullscreen ? 'Exit full screen' : 'Full screen'}</span>
              </button>

              {isFullscreen ? (
                <div
                  className="absolute z-50"
                  style={{
                    left: fullscreenDiceAnchor.left,
                    top: fullscreenDiceAnchor.top,
                    pointerEvents:
                      isUltraPerformance &&
                      isMobileViewport &&
                      diceValue !== null &&
                      selectableTokenIds.length > 0
                        ? 'none'
                        : 'auto',
                  }}
                >
                  <Dice
                    value={diceValue}
                    rolling={diceRolling}
                    disabled={diceRolling || diceValue !== null || phase === 'finished' || currentPlayer?.kind === 'ai'}
                    manualMode={options.manualDiceInput && currentPlayer?.kind !== 'ai'}
                    performanceMode={options.performanceMode}
                    fullscreen
                    minimalFullscreen
                    draggableFullscreen={!isUltraPerformance && currentPlayer?.kind !== 'ai'}
                    mobileViewport={isMobileViewport}
                    dragOffset={diceDragOffset}
                    onFullscreenDragMove={(offset: { x: number; y: number }) =>
                      setDiceDragOffset(clampDiceOffset(offset))
                    }
                    onRoll={handleRoll}
                    onManualSubmit={useManualDice}
                  />
                </div>
              ) : null}
            </div>

            {!isFullscreen ? (
              <div className="grid gap-2 sm:gap-3">
                <div className="relative z-30 xl:hidden">
                  <Dice value={diceValue} rolling={diceRolling} disabled={diceRolling || diceValue !== null || phase === 'finished' || currentPlayer?.kind === 'ai'} manualMode={options.manualDiceInput && currentPlayer?.kind !== 'ai'} performanceMode={options.performanceMode} onRoll={handleRoll} onManualSubmit={useManualDice} />
                </div>
                <div className="grid gap-2 sm:gap-3 xl:-ml-[18rem] xl:w-[calc(100%+18rem)] xl:grid-cols-[minmax(16rem,0.9fr)_minmax(22rem,1.1fr)]">
                  <ControlPanel
                    turnLabel={winner ? `${players.find((player) => player.color === winner)?.name} won` : `${currentPlayer?.name}'s turn`}
                    diceValue={diceValue}
                    selectableCount={selectableTokenIds.length}
                    autoMoveSingle={options.autoMoveSingle}
                    performanceMode={options.performanceMode}
                    showHints={options.showHints}
                    turnTimerSeconds={options.turnTimerSeconds}
                    timerRemaining={timerRemaining}
                    canUndo={undoStack.length > 0}
                    onUndo={undoLastTurn}
                    onHelp={openRules}
                    onReset={openResetConfirm}
                    theme={theme}
                    onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  />
                  <StatsPanel stats={stats} players={players} performanceMode={options.performanceMode} />
                </div>
                <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_20rem] sm:gap-3 xl:grid-cols-1">
                  <div className={`rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-glass ${isPerformance ? '' : 'backdrop-blur-xl'}`}>
                    <div className="mb-3 flex items-center gap-2 text-white">
                      <History className="h-4 w-4" />
                      <p className="font-display text-lg font-semibold">Recent history</p>
                    </div>
                    <MoveHistory entries={moveHistory.slice(0, isUltraPerformance ? 3 : isPerformance ? 5 : 8)} performanceMode={options.performanceMode} />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 xl:hidden xl:gap-3">
                    {PLAYER_ORDER.map((playerColor) => {
                      const player = players.find((item) => item.color === playerColor)!;
                      return <PlayerPanel key={playerColor} player={player} tokens={tokens.filter((token) => token.owner === playerColor)} isActive={currentPlayer?.color === playerColor && phase === 'playing'} isWinner={winner === playerColor} performanceMode={options.performanceMode} />;
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          {!isFullscreen ? (
            <aside className="hidden xl:grid xl:auto-rows-max xl:gap-3">
              {PLAYER_ORDER.map((playerColor) => {
                const player = players.find((item) => item.color === playerColor)!;
                return <PlayerPanel key={playerColor} player={player} tokens={tokens.filter((token) => token.owner === playerColor)} isActive={currentPlayer?.color === playerColor && phase === 'playing'} isWinner={winner === playerColor} performanceMode={options.performanceMode} />;
              })}
            </aside>
          ) : null}
        </main>
      </div>

      <RulesDialog open={showRules} onClose={closeRules} />
      <Modal open={showResetConfirm} onClose={closeResetConfirm} title="Start a new match?" footer={<><button type="button" onClick={() => { closeResetConfirm(); resetToLobby(); }} className="rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950 transition hover:bg-slate-100">Return to lobby</button><button type="button" onClick={closeResetConfirm} className="rounded-2xl border border-white/15 px-4 py-3 font-semibold text-white transition hover:bg-white/10">Keep match</button></>}>
        Current match progress will be replaced. Your saved game remains available until you clear it.
      </Modal>
      <WinnerDialog winner={winner} open={winner !== null} onReplay={() => startGame({ playerCount: lobby.playerCount, players: lobby.players, options: lobby.options })} onLobby={resetToLobby} />
    </div>
  );
}

const latestDelay = (performanceMode: 'off' | 'basic' | 'ultra', kind: 'human' | 'ai') => {
  if (kind === 'human') {
    return 0;
  }
  if (performanceMode === 'ultra') {
    return 260;
  }
  return performanceMode === 'basic' ? 520 : 900;
};

export default App;
