/**
 * The entry point to kick start and configure the game
 */
import { gameLoopObservable } from "engine/loop";
import interrupt from "engine/interrupt";
import { createAudioContext } from "engine/audio";
import configureStore from "./configureStore";
import actionLoop from "./loops/actionLoop";
import strokerLoop from "./loops/strokeEmitter";
import { nextSlide } from "./utils/fetchPictures";
import moanLoop from "./loops/moanLoop";
import ticker from "./loops/ticker";
import {
  strokeSpeedBaseLineAdjustmentLoop,
  strokeSpeedAdjustmentLoop,
  gripAdjustmentLoop,
} from "./loops/strokeSpeedLoop";

const loops = [
  actionLoop,
  strokerLoop,
  moanLoop,
  ticker,
  strokeSpeedAdjustmentLoop,
  strokeSpeedBaseLineAdjustmentLoop,
  gripAdjustmentLoop,
];

const observers: number[] = [];

const startGame = async () => {
  await createAudioContext();
  configureStore();
  nextSlide();

  loops.forEach((loop) => {
    loop.reset();

    const id = gameLoopObservable.subscribe(loop);
    observers.push(id);
  });

  return true;
};

const stopGame = () => {
  interrupt();

  observers.forEach((id) => {
    gameLoopObservable.unsubscribe(id);
  });
};

export { startGame, stopGame };
