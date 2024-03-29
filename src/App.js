import React, { useRef, useEffect, useState } from "react";
import { withGameData } from "./gameContext";

// import logo from './logo.svg';
import "./App.css";
import Sprite from "./utils/Sprite";
import Bird from "./utils/Bird";
import Ground from "./utils/Ground";
import Pipes from "./utils/Pipes";
import playerInput from "./utils/onPlayerInput";

import useEventListener from "./utils/useEventListener";

function isGameOver(gameInstance) {
  // Is the bird touching any pipe?
  for (let i = 0; i < gameInstance.pipes.items.length; i++) {
    const pipe = gameInstance.pipes.items[i];

    if (gameInstance.bird.isTouching(pipe)) {
      return true;
    }
  }

  // Is the bird touching the ground?
  if (
    gameInstance.bird.axisY >
    gameInstance.canvas.height - gameInstance.bird.image.height
  ) {
    return true;
  }

  return false;
}

function displayIntroInstructions(canvas) {
  const context = canvas.getContext("2d");
  context.font = "25px Arial";
  context.fillStyle = "red";
  context.textAlign = "center";
  context.fillText(
    "Press, touch or click to start",
    canvas.width / 2,
    canvas.height / 4
  );
}

function displayGameOver(gameInstance) {
  gameInstance.pipes.items.forEach(pipe => {
    if (pipe.x < gameInstance.bird.axisX) {
      gameInstance.score = gameInstance.score + 0.5;
    }
  });

  const context = gameInstance.canvas.getContext("2d");
  context.font = "30px Arial";
  context.fillStyle = "red";
  context.textAlign = "center";
  context.fillText("Game Over", gameInstance.canvas.width / 2, 100);
  // context.fillText(
  //   "Score: " + gameInstance.score,
  //   gameInstance.canvas.width / 2,
  //   150
  // );
  context.font = "20px Arial";
  context.fillText(
    "Click, touch, or press to play again",
    gameInstance.canvas.width / 2,
    300
  );
}

function renderFrame(gameInstance) {
  gameInstance.context.clearRect(
    0,
    0,
    gameInstance.canvas.width,
    gameInstance.canvas.height
  );
  switch (gameInstance.gameMode) {
    case "prestart": {
      displayIntroInstructions(gameInstance.canvas);
      break;
    }
    case "running": {
      // gameInstance.timeGameLastRunning = new Date();
      gameInstance.bird.renderFrame();
      gameInstance.ground.renderFrame();
      gameInstance.pipes.renderFrame();
      if (isGameOver(gameInstance)) {
        gameInstance.gameMode = "over";
      }
      break;
    }
    case "over": {
      gameInstance.bird.renderFrame();
      displayGameOver(gameInstance);
      break;
    }
  }
}

const App = props => {
  const canvasRef = useRef(null);
  const [gameInstance, setGameInstance] = useState();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let gameInstanceDefault = {
      canvas: null,
      FPS: 40,
      jumpAmount: -10,
      maxFallSpeed: +10,
      acceleration: 1,
      worldSpeed: -3,
      gameMode: "prestart",
      timeGameLastRunning: null,
      ground: null,
      pipes: null,
      bird: null,
      scale: null,
      resetGame: function resetGame() {
        this.bird.reset();
        this.pipes.reset();
      }
    };

    gameInstanceDefault.canvas = canvasRef.current;
    gameInstanceDefault.context = gameInstanceDefault.canvas.getContext("2d");

    const setScale = gameInstanceDefault => {
      const { canvas } = gameInstanceDefault;
      let style = {
        height() {
          return +getComputedStyle(canvas)
            .getPropertyValue("height")
            .slice(0, -2);
        },
        width() {
          return +getComputedStyle(canvas)
            .getPropertyValue("width")
            .slice(0, -2);
        }
      };

      gameInstanceDefault.scale = window.innerHeight / 480;
      canvas.setAttribute("width", style.width() * gameInstanceDefault.scale);
      canvas.setAttribute("height", style.height() * gameInstanceDefault.scale);
    };

    setScale(gameInstanceDefault);

    gameInstanceDefault.ground = new Ground(
      gameInstanceDefault.canvas,
      "./bottom.png",
      gameInstanceDefault.worldSpeed,
      gameInstanceDefault.scale
    );
    
    gameInstanceDefault.pipes = new Pipes(
      gameInstanceDefault.canvas,
      "./pipe.png",
      gameInstanceDefault.worldSpeed,
      gameInstanceDefault.scale
    );

    gameInstanceDefault.bird = new Bird(
      gameInstanceDefault.canvas,
      "./bird.png",
      gameInstanceDefault.maxFallSpeed,
      gameInstanceDefault.acceleration,
      gameInstanceDefault.scale
    );

    setGameInstance(gameInstanceDefault);
  }, []);

  useEffect(() => {
    if (gameInstance && !initialized) {
      setInitialized(true);

      setInterval(() => {
        renderFrame(gameInstance);
      }, 1000 / gameInstance.FPS);
    }
  }, [gameInstance]);

  useEventListener("touchstart", event => playerInput(event, gameInstance));
  useEventListener("mousedown", event => playerInput(event, gameInstance));
  useEventListener("keydown", event => playerInput(event, gameInstance));

  return (
    <div className="App">
      <canvas
        ref={canvasRef}
        id="myCanvas"
        width="320"
        height="480"
        style={{
          background: `url('./back.png')`,
          backgroundSize: `100%`
        }}
      />
    </div>
  );
};

export default withGameData(App);
