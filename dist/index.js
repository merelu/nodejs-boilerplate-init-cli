#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prompts_1 = require("@inquirer/prompts");
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function main() {
    const boilerplateUrl = "https://github.com/merelu/ts-monorepo-template.git";
    const projectName = await (0, prompts_1.input)({
        message: "새 프로젝트의 이름을 입력하세요:",
        validate: (input) => {
            if (!input) {
                return "프로젝트 이름은 비워둘 수 없습니다.";
            }
            if (fs_1.default.existsSync(path_1.default.join(process.cwd(), input))) {
                return `디렉토리 ${input}가 이미 존재합니다. 다른 이름을 선택하세요.`;
            }
            return true;
        },
    });
    const projectType = await (0, prompts_1.select)({
        message: "어떤 유형의 프로젝트를 생성하시겠습니까?",
        choices: [
            { name: "Full Monorepo Project", value: "full" },
            { name: "Sparse Package", value: "sparse" },
        ],
    });
    if (projectType === "full") {
        createFullMonorepoProject(projectName, boilerplateUrl);
    }
    else {
        const sparseOption = await (0, prompts_1.select)({
            message: "어떤 패키지를 선택하시겠습니까?",
            choices: [
                { name: "Nest Package", value: "apps/api" },
                { name: "Common Package", value: "libs/common" },
            ],
        });
        createPackage(projectName, boilerplateUrl, sparseOption);
    }
}
function createFullMonorepoProject(projectName, boilerplateUrl) {
    const projectPath = path_1.default.join(process.cwd(), projectName);
    console.log(`보일러플레이트를 ${boilerplateUrl}에서 클론 중...`);
    (0, child_process_1.execSync)(`git clone ${boilerplateUrl} ${projectPath}`, {
        stdio: "inherit",
    });
    console.log(`프로젝트 생성 중: ${projectName}`);
    process.chdir(projectPath);
    (0, child_process_1.execSync)("rm -rf .git", { stdio: "inherit" });
    (0, child_process_1.execSync)("git init", { stdio: "inherit" });
    console.log(`프로젝트 ${projectName}가 성공적으로 생성되었습니다.`);
}
function createPackage(projectName, boilerplateUrl, sparseFolder) {
    const projectPath = path_1.default.join(process.cwd(), projectName);
    console.log(`보일러플레이트를 ${boilerplateUrl}에서 클론 중...`);
    (0, child_process_1.execSync)(`git init ${projectPath}`, { stdio: "inherit" });
    process.chdir(projectPath);
    (0, child_process_1.execSync)(`git remote add -f origin ${boilerplateUrl}`, {
        stdio: "inherit",
    });
    console.log(`폴더에 대한 sparse checkout 설정 중: ${sparseFolder}`);
    (0, child_process_1.execSync)("git config core.sparseCheckout true", { stdio: "inherit" });
    fs_1.default.writeFileSync(".git/info/sparse-checkout", `${sparseFolder}\n`, "utf8");
    (0, child_process_1.execSync)("git pull origin main", { stdio: "inherit" });
    console.log(`파일을 루트 디렉토리로 이동 중...`);
    (0, child_process_1.execSync)(`mv ${sparseFolder}/* .`, { stdio: "inherit" });
    (0, child_process_1.execSync)(`rm -rf ${sparseFolder.split("/")[0]}`, { stdio: "inherit" });
    console.log(`프로젝트 생성 중: ${projectName}`);
    (0, child_process_1.execSync)("rm -rf .git", { stdio: "inherit" });
    console.log(`패키지 ${projectName}가 성공적으로 생성되었습니다.`);
}
main();
//# sourceMappingURL=index.js.map