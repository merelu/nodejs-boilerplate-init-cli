#!/usr/bin/env node

import { input, select } from "@inquirer/prompts";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

async function main() {
  const boilerplateUrl = "https://github.com/merelu/ts-monorepo-template.git";

  const projectName = await input({
    message: "새 프로젝트의 이름을 입력하세요:",
    validate: (input: string) => {
      if (!input) {
        return "프로젝트 이름은 비워둘 수 없습니다.";
      }
      if (fs.existsSync(path.join(process.cwd(), input))) {
        return `디렉토리 ${input}가 이미 존재합니다. 다른 이름을 선택하세요.`;
      }
      return true;
    },
  });
  const projectType = await select({
    message: "어떤 유형의 프로젝트를 생성하시겠습니까?",
    choices: [
      { name: "Full Monorepo Project", value: "full" },
      { name: "Sparse Package", value: "sparse" },
    ],
  });

  if (projectType === "full") {
    createFullMonorepoProject(projectName, boilerplateUrl);
  } else {
    const sparseOption = await select({
      message: "어떤 패키지를 선택하시겠습니까?",
      choices: [
        { name: "Nest Package", value: "apps/api" },
        { name: "Common Package", value: "libs/common" }, // 필요에 따라 다른 패키지 추가 가능
      ],
    });

    createPackage(projectName, boilerplateUrl, sparseOption);
  }
}

function createFullMonorepoProject(
  projectName: string,
  boilerplateUrl: string,
): void {
  const projectPath = path.join(process.cwd(), projectName);

  console.log(`보일러플레이트를 ${boilerplateUrl}에서 클론 중...`);
  execSync(`git clone ${boilerplateUrl} ${projectPath}`, {
    stdio: "inherit",
  });

  console.log(`프로젝트 생성 중: ${projectName}`);
  process.chdir(projectPath);

  execSync("rm -rf .git", { stdio: "inherit" }); // 기존 git history 제거
  execSync("git init", { stdio: "inherit" }); // 새 git 초기화

  console.log(`프로젝트 ${projectName}가 성공적으로 생성되었습니다.`);
}

function createPackage(
  projectName: string,
  boilerplateUrl: string,
  sparseFolder: string,
): void {
  const projectPath = path.join(process.cwd(), projectName);

  console.log(`보일러플레이트를 ${boilerplateUrl}에서 클론 중...`);

  // git init 및 리포지토리 설정
  execSync(`git init ${projectPath}`, { stdio: "inherit" });
  process.chdir(projectPath);
  execSync(`git remote add -f origin ${boilerplateUrl}`, {
    stdio: "inherit",
  });

  console.log(`폴더에 대한 sparse checkout 설정 중: ${sparseFolder}`);
  execSync("git config core.sparseCheckout true", { stdio: "inherit" });

  // 미리 정의된 폴더를 sparse-checkout 파일에 작성
  fs.writeFileSync(".git/info/sparse-checkout", `${sparseFolder}\n`, "utf8");

  // 필요한 파일을 가져옴
  execSync("git pull origin main", { stdio: "inherit" });

  console.log(`파일을 루트 디렉토리로 이동 중...`);

  // 파일을 sparseFolder/*에서 루트로 이동
  execSync(`mv ${sparseFolder}/* .`, { stdio: "inherit" });

  // 빈 sparseFolder 디렉토리 제거
  execSync(`rm -rf ${sparseFolder.split("/")[0]}`, { stdio: "inherit" });

  console.log(`프로젝트 생성 중: ${projectName}`);

  // .git 디렉토리를 제거하여 새로운 프로젝트로 만듦
  execSync("rm -rf .git", { stdio: "inherit" });

  console.log(`패키지 ${projectName}가 성공적으로 생성되었습니다.`);
}

main();
