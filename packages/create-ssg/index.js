#!/usr/bin/env node

import { execSync } from "node:child_process";
import { cp, mkdir, readdir, writeFile } from "node:fs/promises";
import { dirname, basename, resolve, join } from "node:path";

import chalk from "chalk";
import { program } from "commander";
import inquirer from "inquirer";

import pkg from "./package.json" with { type: "json" };

async function write(path, data, options) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, data, options);
}

function isDirEmpty(dirname) {
  return readdir(dirname).then(files => files.length === 0);
}

function defaultAnswers(questions, answers) {
  for (const q of questions) {
    answers[q.name] = answers[q.name] ?? q.default;
  }

  return answers;
}

async function collectInfos(projectDir, { yes }) {
  const questions = [
    {
      type: "input",
      name: "projectDir",
      message: "Project Directory",
      default: ".",
    },
    {
      type: "checkbox",
      name: "cssProcessors",
      message: "CSS Processing",
      choices: [
        { name: "Sass", value: "sass" },
        { name: "PostCSS", value: "postcss" },
      ],
      default: ["postcss"],
    },
    {
      when: ({ cssProcessors }) => cssProcessors.includes("postcss"),
      type: "checkbox",
      name: "postcssModules",
      message: "PostCSS Modules",
      choices: [
        { name: "CSS Modules", value: "postcss-modules" },
        { name: "Scoped CSS", value: "" },
      ],
      default: ["postcss-modules", ""],
    },
  ];

  const answers = yes
    ? defaultAnswers(questions, { projectDir })
    : await inquirer.prompt(questions, { projectDir });

  return {
    projectDir: resolve(process.cwd(), answers.projectDir),
    dependencies: [],
    devDependencies: [
      "@xylit/ssg",
      ...(answers.cssProcessors || []),
      ...(answers.postcssModules || []),
    ],
  };
}

function npmInstall(cwd, dependencies, flags = "") {
  if (!dependencies?.length) return;

  execSync(`npm i ${flags} ${dependencies.join(" ")}`, {
    cwd,
    stdio: [0, 1, 2],
  });
}

program
  .description(pkg.description)
  .argument("[string]", "your project directory")
  .option("-y, --yes", "skip the questionaire while using the defaults")
  .version(pkg.version, "-v, --version")
  .action(async (dir, options) => {
    const { projectDir, dependencies, devDependencies } = await collectInfos(
      dir,
      options,
    );

    const pkgInfo = JSON.stringify(
      {
        name: basename(projectDir),
        version: "0.0.0",
        type: "module",
        private: "true",
        scripts: {
          serve: "npx @xylit/ssg serve",
          build: "npx @xylit/ssg build",
        },
      },
      null,
      2,
    );

    await mkdir(projectDir, { recursive: true });

    if (await isDirEmpty(projectDir)) {
      await cp(join(import.meta.dirname, "templates", "default"), projectDir, {
        recursive: true,
      });

      await write(join(projectDir, "package.json"), pkgInfo);
      await npmInstall(projectDir, dependencies);
      await npmInstall(projectDir, devDependencies, "-D");
    } else {
      console.error(
        chalk.red.bold("...Creation Aborted. The given folder is not empty."),
      );
    }
  })
  .parse(process.argv);
