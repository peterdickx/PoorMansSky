/*MIT License

Copyright (c) 2016 Peter Dickx

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

"use strict";
import context from "./scripts/context.js";
import * as Utils from "./scripts/utils.js";
import * as Noise from "./scripts/noise.js";

window.onkeydown = keyPressed;

window.ontouchstart = touch;

let width = context.canvas.width;
let height = context.canvas.height;

let quarter = 0;
let middle = 0;

let xSpeed = 0.02;
let ySpeed = 0;
let xMaxSpeed = 1;
let yMaxSpeed = 10;
let shipWidth = 40;
let shipHeight = 20;

let shipY = 50;
let xPosition;
let zoom = 300;

let frameCount = 0;
let isPlaying = true;
let isFirstTime = true;

let iExplosion = 1;

setup();
draw();

function setup() {
    quarter = height / 4;
    middle = width / 2;
    shipWidth = 50;
    shipHeight = 40;
    xPosition = Utils.randomNumber(0, 10000);
    context.fillStyle = "red";
    context.textAlign = "center";
    context.font = "normal 200pt Arial";
    context.lineWidth = 2;
}

/**
 * 
 * @param {KeyboardEvent} eventData 
 */
function keyPressed(eventData) {
    if (eventData.code == "Space") {
        if (!isPlaying) {
            isPlaying = true;
            isFirstTime = false;
            shipY = 50;
            xPosition = Utils.randomNumber(0, 10000);
            iExplosion = 0;
        }
    }

    if (eventData.code == "ArrowRight") {
        if (xSpeed < xMaxSpeed) {
            xSpeed += 0.005;
        }
    } else if (eventData.code == "ArrowLeft") {
        if (xSpeed > -xMaxSpeed) {
            xSpeed -= 0.005;
        }
    } else if (eventData.code == "ArrowUp") {
        if (ySpeed > -yMaxSpeed) {
            ySpeed -= 1;
        }
    } else if (eventData.code == "ArrowDown") {
        if (ySpeed < yMaxSpeed) {
            ySpeed += 1;
        }
    }
}

function reset() {
    if (!isPlaying) {
        isPlaying = true;
        isFirstTime = false;
        shipY = 50;
        xPosition = Utils.randomNumber(0, 10000);
        iExplosion = 0;
    }
}

/**
 * 
 * @param {TouchEvent} eventData 
 */
function touch(eventData) {
    eventData.preventDefault();
    if (eventData.touches.length >= 1) {
        reset();
        let touchX = eventData.touches[0].pageX;
        let touchY = eventData.touches[0].pageY;
        if (Utils.calculateDistance(touchX, touchY, width - 35, height - 100) < 35) {
            if (xSpeed < xMaxSpeed) {
                xSpeed += 0.005;
            }
        } else if (Utils.calculateDistance(touchX, touchY, width - 135, height - 100) < 35) {
            if (xSpeed > -xMaxSpeed) {
                xSpeed -= 0.005;
            }
        }

        if (Utils.calculateDistance(touchX, touchY, width - 85, height - 150) < 35) {
            if (ySpeed < yMaxSpeed) {
                ySpeed += 1;
            }
        } else if (Utils.calculateDistance(touchX, touchY, width - 85, height - 50) < 35) {
            if (ySpeed > -yMaxSpeed) {
                ySpeed -= 1;
            }
        }
    }
}

function draw() {
    frameCount++;
    context.fillStyle = Utils.hsl(200, 70, 50);
    context.fillRect(0, 0, width, height);

    if (shipY < 20) {
        ySpeed = 0;
        shipY = 20;
    }

    xPosition += xSpeed;
    shipY += ySpeed;

    for (let i = 0; i < width; i++) {

        let y = height - Noise.perlinNoise(xPosition + i / zoom) * height;

        //grass
        context.strokeStyle = Utils.hsl(120, 50, 35);
        Utils.drawLine(i, y, i, height);

        let waterline = quarter * 3;

        if (y > waterline) {

            context.strokeStyle = Utils.hsl(240, 100, 58);
            Utils.drawLine(i, y, i, waterline);
        }

        let rockline = quarter * 2 + Noise.perlinNoise(xPosition + i / zoom) * quarter;

        if (y < rockline) {
            context.strokeStyle = Utils.hsl(0, 0, 39);
            Utils.drawLine(i, y, i, rockline);
        }

        let snowline = quarter + quarter / 4 * 1 + Noise.perlinNoise(1000 + Noise.perlinNoise(xPosition + i / zoom) * (quarter / 2) / (zoom / 10)) * quarter;

        if (y < snowline) {
            context.strokeStyle = Utils.hsl(0, 0, 100);
            Utils.drawLine(i, y, i, snowline);
        }
    }

    //spaceShip

    let xDirection = 1;

    if (xSpeed < 0) {
        xDirection = -1;
    }

    for (let i = 0; i < shipWidth; i++) {

        let y = height - Noise.perlinNoise(xPosition + (middle - shipWidth / 2 + i) / zoom) * height;

        if (y < shipY + shipHeight / 2) {
            isPlaying = false;
            xSpeed = 0;
            ySpeed = 0;
        }
    }

    if (isPlaying) {
        context.fillStyle = Utils.hsl(20 + frameCount % 12 * 2, 100, 50);
        Utils.fillTriangle(middle + (shipWidth / 2 + 5) * -xDirection, shipY - shipHeight / 4, middle + (shipWidth + shipWidth / 4) * -xDirection, shipY, middle + (shipWidth / 2 + 5) * -xDirection, shipY + shipHeight / 4);
        context.fillStyle = Utils.hsl(0, 100, 50);
        Utils.fillTriangle(middle - shipWidth / 2 * xDirection, shipY - shipHeight / 2, middle + shipWidth / 2 * xDirection, shipY, middle - shipWidth / 2 * xDirection, shipY + shipHeight / 2);

        //UI
        context.fillStyle = "darkblue";
        Utils.fillCircle(width - 35, height - 100, 35);
        Utils.fillCircle(width - 85, height - 150, 35);
        Utils.fillCircle(width - 85, height - 50, 35);
        Utils.fillCircle(width - 135, height - 100, 35);
        context.fillStyle = "white";
        Utils.fillTriangle(width - 60, height - 135, width - 110, height - 135, width - 85, height - 180);
        Utils.fillTriangle(width - 50, height - 75, width - 50, height - 125, width - 5, height - 100);
        Utils.fillTriangle(width - 60, height - 65, width - 110, height - 65, width - 85, height - 20);
        Utils.fillTriangle(width - 120, height - 75, width - 120, height - 125, width - 165, height - 100);
    } else if (isFirstTime) {
        context.fillStyle = "black";
        context.fillRect(0, 0, width, height);
        context.fillStyle = Utils.hsl(frameCount % 25, 100, 50);
        context.font = "normal 76pt Arial";
        context.fillText("POOR MAN'S SKY", middle, height / 2 - 50);
        context.fillStyle = Utils.hsl(20 + frameCount % 25, 100, 50);
        context.font = "normal 48pt Arial";
        context.fillText("Press Space to Start", middle, height / 2 + 50);
        context.fillStyle = Utils.hsl(0, 0, 75);
        context.font = "normal 28pt Arial";
        context.fillText("Use the arrow keys to fly around", middle, height / 2 + 125);
    } else if (iExplosion < 150) {
        if (iExplosion < 50) {
            context.fillStyle = Utils.hsl(iExplosion / 2.0, 100, 50);
            Utils.fillCircle(middle, shipY, shipWidth + iExplosion);
            context.fillStyle = Utils.hsl(10 + iExplosion / 2.0, 100, 50);
            Utils.fillCircle(middle, shipY, shipWidth - 10 + iExplosion);
            context.fillStyle = Utils.hsl(20 + iExplosion / 2.0, 100, 50);
            Utils.fillCircle(middle, shipY, shipWidth - 20 + iExplosion);
        }
        iExplosion += 5;
    } else {
        context.fillStyle = "black";
        context.fillRect(0, 0, width, height);
        context.fillStyle = Utils.hsl(frameCount % 25, 100, 50);
        context.font = "normal 100pt Arial";
        context.fillText("GAME OVER", middle, height / 2 - 50);
        context.fillStyle = Utils.hsl(20 + frameCount % 25, 100, 50);
        context.font = "normal 48pt Arial";
        context.fillText("Press Space to Restart", middle, height / 2 + 50);
    }

    requestAnimationFrame(draw);
}