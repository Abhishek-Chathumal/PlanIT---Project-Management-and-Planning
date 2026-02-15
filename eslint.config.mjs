import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";

/** @type {import("eslint").Linter.Config[]} */
export default [
    // Global ignores
    {
        ignores: [
            "**/node_modules/**",
            "**/dist/**",
            "**/build/**",
            "**/coverage/**",
            "**/target/**",
            "**/.turbo/**",
        ],
    },

    // Base JS rules
    js.configs.recommended,

    // TypeScript files
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,

            // TypeScript-specific
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/consistent-type-imports": [
                "error",
                { prefer: "type-imports" },
            ],

            // General
            "no-console": ["warn", { allow: ["warn", "error"] }],
            "no-debugger": "error",
            "prefer-const": "error",
            "no-var": "error",
            eqeqeq: ["error", "always"],
        },
    },

    // Backend services — Node.js globals
    {
        files: ["services/**/*.ts"],
        languageOptions: {
            globals: {
                process: "readonly",
                console: "readonly",
                __dirname: "readonly",
                __filename: "readonly",
                module: "readonly",
                require: "readonly",
                Buffer: "readonly",
                setTimeout: "readonly",
                setInterval: "readonly",
                clearTimeout: "readonly",
                clearInterval: "readonly",
            },
        },
        rules: {
            "no-console": ["warn", { allow: ["log", "warn", "error", "info"] }],
            // NestJS DI requires runtime class references, not type-only imports
            "@typescript-eslint/consistent-type-imports": "off",
        },
    },

    // Frontend apps — Browser globals
    {
        files: ["apps/**/*.ts", "apps/**/*.tsx"],
        languageOptions: {
            globals: {
                window: "readonly",
                document: "readonly",
                localStorage: "readonly",
                sessionStorage: "readonly",
                fetch: "readonly",
                Request: "readonly",
                Response: "readonly",
                Headers: "readonly",
                RequestInit: "readonly",
                URL: "readonly",
                HTMLElement: "readonly",
                HTMLDivElement: "readonly",
                MouseEvent: "readonly",
                Node: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                setInterval: "readonly",
                clearInterval: "readonly",
                console: "readonly",
                React: "readonly",
                JSX: "readonly",
            },
        },
    },

    // Test files — Jest globals
    {
        files: ["**/*.spec.ts", "**/*.test.ts", "**/*.spec.tsx", "**/*.test.tsx"],
        languageOptions: {
            globals: {
                jest: "readonly",
                describe: "readonly",
                it: "readonly",
                expect: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly",
                beforeAll: "readonly",
                afterAll: "readonly",
            },
        },
    },

    // Disable formatting rules (handled by Prettier)
    prettierConfig,
];
