import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const relaxedTsRules = {
	'no-console': 'off',
	'no-undef': 'off',
	'prefer-const': 'off',
	'@typescript-eslint/no-explicit-any': 'off',
	'@typescript-eslint/no-empty-object-type': 'off',
	'@typescript-eslint/no-unused-vars': [
		'warn',
		{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
	],
	'@typescript-eslint/no-require-imports': 'off',
	'@typescript-eslint/no-unused-expressions': 'off',
	'@typescript-eslint/ban-ts-comment': 'off'
};

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		ignores: [
			'**/node_modules/**',
			'**/dist/**',
			'**/build/**',
			'**/.svelte-kit/**',
			'packages/desktop/**',
			'packages/desktop-v3/**',
			'packages/docs/**',
			'packages/mcp-debug/**',
			'packages/platform-playground/**',
			'packages/pages/public/**',
			'packages/pages/worker-configuration.d.ts',
			'**/target/**',
			'.land/**',
			'eslint.config.mjs'
		]
	},
	{
		files: ['packages/desktop-tauri/src/**/*.ts'],
		ignores: ['**/*.test.ts'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname
			}
		},
		rules: relaxedTsRules
	},
	{
		files: [
			'packages/desktop-tauri/api/**/*.ts',
			'packages/desktop-tauri/scripts/**/*.ts',
			'packages/desktop-tauri/*.ts'
		],
		ignores: ['**/*.test.ts'],
		languageOptions: {
			globals: globals.node
		},
		rules: relaxedTsRules
	},
	{
		files: ['packages/desktop-tauri/**/*.mjs'],
		languageOptions: {
			globals: globals.node
		},
		rules: relaxedTsRules
	},
	{
		files: ['packages/pages/src/**/*.ts'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname
			}
		},
		rules: relaxedTsRules
	},
	{
		files: ['packages/desktop-tauri/**/*.test.ts'],
		languageOptions: {
			globals: {
				...globals.node,
				...globals.vitest
			}
		},
		rules: relaxedTsRules
	},
	{
		files: ['packages/pages/test/**/*.ts'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname
			}
		},
		rules: relaxedTsRules
	}
);