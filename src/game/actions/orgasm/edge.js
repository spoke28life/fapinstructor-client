import store from "store";
import play from "engine/audio";
import audioLibrary from "audio";
import elapsedGameTime from "game/utils/elapsedGameTime";
import { getRandomStrokeSpeed, setStrokeSpeed } from "game/utils/strokeSpeed";
import { setDefaultGrip } from "game/actions/grip";
import { setDefaultStrokeStyle } from "game/enums/StrokeStyle";
import createNotification, {
  dismissNotification,
} from "engine/createNotification";
import { getRandomBoolean, getRandomInclusiveInteger } from "utils/math";
import delay from "utils/delay";
import { strokerRemoteControl } from "game/loops/strokeEmitter";
import handsOff from "game/actions/speed/handsOff";
import { getRandom_edge_message } from "game/texts/messages";
import punishment from "../punishment";
import { getRandomEdge } from "./edgeInTime";
import { clearStrokeEmissions } from "game/loops/strokeEmitter";

/**
 * Determines if the user should edge.
 *
 * @returns {boolean}
 *   true when the user should edge now
 */
export const shouldEdge = () => {
  const {
    config: {
      minimumGameTime,
      maximumGameTime,
      actionFrequency,
      edgeFrequency,
    },
  } = store;

  let result = false;
  const isAllowedChance = elapsedGameTime("minutes") >= minimumGameTime * 1.2;

  if (isAllowedChance) {
    const rand = Math.random();
    const gameCompletionPercent =
      elapsedGameTime("seconds") / (maximumGameTime * 60);

    // Probability Graph: https://www.desmos.com/calculator/atc32p8kof
    result =
      (gameCompletionPercent / actionFrequency) * (1 + edgeFrequency / 100) >
      rand;
  }

  return result;
};

/**
 * lets you ride the edge for time seconds.
 *
 * @param time
 *   How long to ride the edge
 */
export const rideTheEdge = async (time = getRandomInclusiveInteger(5, 30)) => {
  clearStrokeEmissions();

  const strokeSpeed = store.game.strokeSpeed;
  setStrokeSpeed(0);
  const notificationId = createNotification({
    message: "Ride the edge",
    duration: -1,
  });

  if (store.enableVoice) {
    play(audioLibrary.KeepStroking);
  }

  await delay(time * 1000);
  dismissNotification(notificationId);
  setStrokeSpeed(strokeSpeed);
};

/**
 * Decides whether to ride the edge or not and increases edge counter.
 *
 * @param time
 *   How long to ride the edge
 */
export const edging = async (time) => {
  store.game.edges++;

  const holdIt = getRandomBoolean();

  if (holdIt || time) {
    await rideTheEdge(time);
  }
};

/**
 * The whole cooldown stuff after edging and setting up the stroking task again.
 */
export const stopEdging = async () => {
  let edgeCooldown = parseInt(store.config.edgeCooldown, 10);
  if (store.game.orgasm && !store.game.edgingLadder) {
  } else {
    strokerRemoteControl.pause();
    //Just to make it a little bit random. So one does not get exactly XY seconds cooldown every time.
    let approx = getRandomInclusiveInteger(
      Math.floor(edgeCooldown / 2),
      Math.floor((edgeCooldown * 3) / 2)
    );
    await handsOff(approx);

    setStrokeSpeed(getRandomStrokeSpeed());

    strokerRemoteControl.play();

    if (store.enableVoice) {
      play(audioLibrary.StartStrokingAgain);
    }
    await delay(2000);
  }
};

/**
 * Sets the Speed to Maximum, the Grip and the StrokeStyle to default. Displays message.
 *
 * @param message
 *   the message that is displayed.
 * @returns {Promise<*>}
 *   the notificationId
 */
export const getToTheEdge = async (message = getRandom_edge_message()) => {
  const {
    config: { fastestStrokeSpeed },
  } = store;
  if (store.enableVoice) {
    play(audioLibrary.Edge);
  }

  setStrokeSpeed(fastestStrokeSpeed);

  setDefaultGrip();
  setDefaultStrokeStyle();

  return createNotification({ message, duration: -1 });
};

/**
 * Calls getToTheEdge() and displays an "Edging" button.
 *
 * @returns {Promise<*[]>}
 */
export const edge = async (time, message = getRandom_edge_message()) => {
  const notificationId = await getToTheEdge(message);

  const trigger = async () => {
    dismissNotification(notificationId);
    await edging(time);
    await stopEdging();
  };
  trigger.label = "Edging";

  const trigger_fail = async () => {
    dismissNotification(notificationId);
    await punishment();
  };
  trigger_fail.label = "I can't";

  return [trigger, trigger_fail];
};

/**
 * makes advanced Edges possible if active.
 *
 * @returns {Promise<function(): *[]>} the action to be executed next.
 */
const determineEdge = async (time, message) => {
  let action;
  if (store.config.advancedEdging) {
    // Determine further chances only if advancedEdging is active
    action = await getRandomEdge()(time, message);
  } else {
    action = await edge(time);
  }
  return await action;
};

export default determineEdge;
