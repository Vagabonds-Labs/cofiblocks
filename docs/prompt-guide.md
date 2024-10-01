# CofiBlocks Prompt Guide

## Introduction

This guide will help you effectively use our custom prompts for generating components and other code-related tasks in the CofiBlocks project. We utilize SudoLang, a powerful pseudocode programming language designed for AI collaboration.

## Quick Reference to SudoLang

SudoLang is a programming language designed to collaborate with AI language models. Key features include:

- Natural language constraint-based programming
- Interfaces for defining structure and behavior
- `/commands` for chat or programmatic interfaces
- Semantic Pattern Matching
- Referential omnipotence
- Functions and function composition

For comprehensive documentation and examples, visit the [SudoLang GitHub repository](https://github.com/paralleldrive/sudolang-llm-support/tree/main).

## Available Prompts

1. V0PromptWithComponent
2. TailwindReactComponentGenerator
3. PerplexityBot

## How to Use

### 1. V0PromptWithComponent

This prompt generates a v0.dev prompt for creating React components.

#### Usage:

1. Use the `/v0` command followed by your component description.
2. Example: `/v0 Create a responsive navigation bar with a logo, menu items, and a search bar`

#### Output:
The prompt will generate a v0.dev compatible prompt and a clickable URL link that you can use to create your desired component.

### 2. TailwindReactComponentGenerator

This prompt generates a React component with Tailwind CSS classes based on your configuration.

#### Usage:

1. Use the `/g` command to generate a React component.
2. Provide the component name and any specific Tailwind classes you want to include.
3. Example: `/g MyComponent bg-primary text-white p-4`

#### Output:
The prompt will generate a functional React component with the specified Tailwind classes applied.

### 3. PerplexityBot

This prompt helps you search for information on Perplexity.ai.

#### Usage:

1. Use the `/p` command followed by your search query.
2. Example: `/p What is the capital of France?`

#### Output:
The prompt will generate a URL-encoded search prompt and return a clickable link to Perplexity.ai.

## Best Practices

1. Be specific in your component descriptions to get the most accurate results.
2. Review and test the generated components to ensure they meet your requirements.
3. Use the generated components as a starting point and customize them further as needed.
4. Refer to the Tailwind CSS documentation for class names and utility classes.
5. When using PerplexityBot, formulate clear and concise queries for best results.

## Troubleshooting

If you encounter any issues or unexpected results:

1. Double-check your command syntax and ensure you're using the correct prompt.
2. Try rephrasing your component description or requirements.
3. Consult the SudoLang documentation for advanced usage and techniques.
4. For v0.dev prompts, ensure you're following their guidelines for best results.
5. When using PerplexityBot, try reformulating your query if you don't get the desired information.

## Additional Resources

- @v0.sudo: Contains the full implementation of the V0PromptWithComponent.
- @generate-component.sudo: Provides the complete TailwindReactComponentGenerator implementation.
- @perplexity.sudo: Includes the full PerplexityBot implementation.

These resources can be helpful if you need to understand the underlying logic or want to modify the prompts for more advanced use cases.

For additional support or questions, please reach out to the development team.