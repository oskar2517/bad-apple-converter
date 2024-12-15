const ANGLE_THRESHOLD = 0.3;
const STEP_SIZE = 5;

const SCREEN_HEIGHT = 480;

const buttonSelectDirectory = document.querySelector("#buttonSelectDirectory");

function calculateAngle(p1, p2) {
    const deltaX = p2.x - p1.x;
    const deltaY = p2.y - p1.y;
    return Math.atan2(deltaY, deltaX);
}

function calculateDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function processSvg(path) {
    const pathLength = Math.floor(path.getTotalLength());
    const lines = [];

    for (let i = 0; i < pathLength; i += STEP_SIZE) {
        const p1 = path.getPointAtLength(i);

        const pNext = path.getPointAtLength(i + STEP_SIZE);

        if ((calculateDistance(p1, pNext) | 0) > STEP_SIZE) {
            continue;
        }

        for (let j = i + STEP_SIZE; j < pathLength; j += STEP_SIZE) {
            const p2 = path.getPointAtLength(j);
            const p3 = path.getPointAtLength(j + STEP_SIZE);

            const currentAngle = calculateAngle(p1, p2);
            const nextAngle = calculateAngle(p2, p3);

            if (Math.abs(nextAngle - currentAngle) > ANGLE_THRESHOLD || (calculateDistance(p2, p3) | 0) > STEP_SIZE) {
                lines.push({
                    x1: Math.floor(p1.x),
                    y1: Math.floor(SCREEN_HEIGHT - p1.y),
                    x2: Math.floor(p2.x),
                    y2: Math.floor(SCREEN_HEIGHT - p2.y)
                });

                i = j - STEP_SIZE;

                break;
            }
        }
    }

    let program = `proc main() {\r\n`;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        program += `    drawLine(${line.x1}, ${line.y1}, ${line.x2}, ${line.y2}, ${(mapIntegerToRainbowColor(i, lines.length))});\r\n`;
    }
    program += "}\r\n";

    return program;
}

function readFileData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsText(file);
    })
}

buttonSelectDirectory.addEventListener("click", async () => {

    const directoryHandle = await window.showDirectoryPicker();

    if (!directoryHandle) {
        return;
    }

    const outputDirectoryHandle = await directoryHandle.getDirectoryHandle("output", { create: true });

    for await (const entry of directoryHandle.entries()) {
        if (entry[1].kind !== "file") {
            continue;
        }

        const file = await entry[1].getFile();
        const fileData = await readFileData(file);

        const parser = new DOMParser();
        const fileDom = parser.parseFromString(fileData, "text/html");
        const path = fileDom.querySelector("path");

        const program = processSvg(path);

        const outputFileHandle = await outputDirectoryHandle.getFileHandle(`${file.name.split(".").shift()}.spl`, { create: true });
        const outputWritable = await outputFileHandle.createWritable();
        outputWritable.write(program);
        outputWritable.close();


        console.log(`Processed ${file.name}`);
    }
});