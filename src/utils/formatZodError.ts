import { ZodError } from 'zod';

export const formatZodError = (error: ZodError) => {
  const formattedIssues: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.join('.');

    if (!formattedIssues[key]) {
      formattedIssues[key] = [];
    }

    formattedIssues[key].push(issue.message);
  }

  return formattedIssues;
};
