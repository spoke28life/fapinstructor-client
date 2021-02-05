import React from "react";
import * as Sentry from "@sentry/react";
import { Redirect } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { withRouter } from "react-router-dom";
import { startGame, stopGame } from "game";
import store from "store";
import { CircularProgress, Paper } from "@material-ui/core";
import HUD from "containers/HUD";
import MediaPlayer from "components/organisms/MediaPlayer";
import NavBar from "components/organisms/NavBar";
import { nextSlide } from "game/utils/fetchPictures";
import isUUID from "utils/is-uuid";
import config from "config";
import ErrorCard from "components/molecules/ErrorCard";
import SharedGameCard from "components/organisms/SharedGameCard";
import SoloGameCard from "components/organisms/SoloGameCard";
import { ProxyStoreConsumer } from "containers/StoreProvider";
import ExitGamePrompt from "components/organisms/ExitGamePrompt";

const styles = () => ({
  progress: {
    position: "absolute",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100vw",
    height: "100vh",
  },
  container: {
    height: "100vh",
    width: "100vw",
    backgroundColor: "black",
  },
  startgame: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: `url(${config.imageUrl}/background.jpg)`,
    backgroundSize: "cover",
    backgroundAttachment: "fixed",
  },
});

class GamePage extends React.Component {
  state = {
    gameStarted: false,
    error: null,
    isSharedGame: false,
    gameConfigId: null,
  };

  async componentDidMount() {
    const gameConfigId = this.props.match.params.config;

    if (gameConfigId) {
      this.setState({
        isSharedGame: true,
        gameConfigId,
      });

      if (!isUUID(gameConfigId)) {
        this.setState({
          error: "The game config link is invalid",
        });
      }
    } else if (store.config.isDefaultConfig) {
      this.props.history.push("/");
    } else {
      this.setState({
        isSharedGame: false,
      });
    }

    // Load global game preferences
    try {
      store.enableVoice = localStorage.getItem("enableVoice")
        ? localStorage.getItem("enableVoice") === "true"
        : true;
      store.enableMoans = localStorage.getItem("enableMoans")
        ? localStorage.getItem("enableMoans") === "true"
        : true;
      store.videoMuted = localStorage.getItem("videoMuted")
        ? localStorage.getItem("videoMuted") === "true"
        : false;
      store.enableTicks = localStorage.getItem("enableTicks")
        ? localStorage.getItem("enableTicks") === "true"
        : true;
      store.enableBeatMeter = localStorage.getItem("enableBeatMeter")
        ? localStorage.getItem("enableBeatMeter") === "true"
        : true;
    } catch {
      // In some cases local storage might be disabled
    }

    Sentry.setTag("page", "game");
    Sentry.setContext("game_config", {
      gameConfigId,
    });
  }

  componentWillUnmount() {
    stopGame();
  }

  handleStartGame = () => {
    startGame().then((gameStarted) => {
      this.setState({ gameStarted });
    });
  };

  render() {
    const { gameStarted, isSharedGame, gameConfigId, error } = this.state;
    const { classes } = this.props;

    if (!gameStarted) {
      return (
        <>
          <NavBar />
          <div className={classes.startgame}>
            <Paper style={{ padding: 10 }}>
              {error && <ErrorCard error={error} />}
              {!error && isSharedGame && (
                <SharedGameCard
                  gameConfigId={gameConfigId}
                  onStart={this.handleStartGame}
                />
              )}
              {!error && !isSharedGame && (
                <SoloGameCard onStart={this.handleStartGame} />
              )}
            </Paper>
          </div>
        </>
      );
    }

    return (
      <ProxyStoreConsumer>
        {({
          game: { orgasms, activeLink },
          config: { maximumOrgasms, slideDuration },
          videoMuted,
        }) => (
          <div className={this.props.classes.container}>
            {parseInt(maximumOrgasms, 10) === parseInt(orgasms, 10) ? (
              <Redirect to="/endgame" />
            ) : (
              <>
                <ExitGamePrompt />
                <HUD />
                {(activeLink && (
                  <MediaPlayer
                    link={activeLink}
                    onEnded={nextSlide}
                    duration={slideDuration}
                    muted={videoMuted}
                  />
                )) || (
                  <div className={this.props.classes.progress}>
                    <CircularProgress
                      color="secondary"
                      size={100}
                      thickness={2}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </ProxyStoreConsumer>
    );
  }
}

export default withRouter(withStyles(styles)(GamePage));
