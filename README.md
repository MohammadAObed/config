# @mohammad_obed/config

One package to rule ESLint, TypeScript, and Prettier — plus tiny CLIs

## installation

execute this command in your project: `npm i -D @mohammad_obed/config`

## usage

### statement

this package does not configure explicitly any path of some kind for any setting such for typescript, eslint, etc..., because the paths might resolve to the package root folder and not consumer project root folder! for example in tsconfig: `"baseUrl": "src"` will result in `"baseUrl": "./node_modules/@mohammad_obed/config/src"`

### initial configuration

make sure you have prettier and eslint extensions installed in vscode then:

go to node_modules/@mohammad_obed/config and:

copy the content of vscode.settings.json to your project .vscode/settings.json file (you create the .vscode folder and settings.json file, they are in the root folder of your project), .gitignore should have .vscode/settings.json file, so it does not get pushed to the repo

this .vscode/settings.json file is a standard that people tell you when you want to override and add settings to vscode, it will configure eslint and prettier

### typescript configuration

create a file called `tsconfig.json` in the root folder of your project and copy this code:

```json
{
  "extends": "@mohammad_obed/config/tsconfig.base.json"
  //... you can add your own settings here...eco
}
```

vsode will read this file and apply the settings to your project, and show errors if any, also there is a comand in the vscode terminal that you can execute: `npx moc-check-types`

Note: i recommend 100% to have the below settings in tsconfig:

```json
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"]
    }
  }
```

it will make the importing of files in the project cleaner, so you can import files like this:

```typescript
import { getRandomNumber } from "@/utils/number"; //always from the root folder src, like @/utils/... or @/constants/...
//instead of import { getRandomNumber } from "../../utils/number";
```

### formatting code and prettify it (prttier)

you go to package.json and add the following:
`"prettier": "@mohammad_obed/config/prettier.config"`

thats it, in vscode you should have prettier extension installed, and it will read the config, hit ctrl+shift+p

### code quality and standardization (eslint)

in root folder of project, create a file called `eslint.config.ts` and copy this code:

```typescript
import config from "@mohammad_obed/config/eslint.config";
export default config;
```

vsode will read this file and apply the settings to your project, and show errors if any, also there is a comand in the vscode terminal that you can execute: `npx moc-lint`

Works across typescript, React, and React Native. Production installs stay clean.

### notes

- whenever typescript in vscode gets clumsy, not picking changes or whatever: ctrl+shift+p and type: typescript: restart ts server, so it picks up the changes
- whenever eslint in vscode gets clumsy, not picking changes or whatever: ctrl+shift+p and type: eslint: restart eslint server, so it picks up the changes
- if nothing is working try ctrl+shift+p and Developer: reload window, or restart vscode

## development (how this project was built)

this package is built from scratch like:
`npm init -y` generates `package.json`
`npm i typescript` generates `package-lock.json` file and `node_modules` folder
create a `tsconfig.base.json` file for the base TypeScript configuration, the project and any others will extend this file in their `tsconfig.json`
create a `README.md` file for the documentation
create a `.gitignore` file
created other files as well manually

Note: please configure your eslint, prettier extensions in a .vscode/settings.json file (you create the folder and file), so it reads from the configs inside eslint.config.ts and prettier.config.ts if any, so everything consistent accross all projects.
and always make sure to modify the tsconfig to your liking, base should not have includes array, but the project tsconfig should have it, so it can include the files you want to lint and format. arrayslike exclude and include are replaced when overridden in project tsconfig

also make sure to for typescritpt tsconfig changes to ctrl+shift+p and typescript: restart ts server, so it picks up the changes
also make sure for eslint changes to ctrl+shift+p and eslint: restart eslint server, so it picks up the changes
also if nothing is working try ctrl+shift+p and Developer: reload window, or restart vscode

### cloning the repository

to contribute to this package, you can clone the repository and run the following command:

`git clone <repo>`
