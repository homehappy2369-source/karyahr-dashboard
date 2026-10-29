<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep payroll at `/` and the overview at `/dashboard` to preserve the existing payroll URL and workflow.
- HR features share the existing demo provider; password settings update only the signed-in demo account, not a production authentication service.
- Recruitment initializes empty; one-time legacy sample cleanup must preserve manually entered recruitment records and all unrelated HR data.
- Keep pure password validation and recruitment cleanup in `src/lib/hr-rules.ts` so these rules are testable without rendering pages.
