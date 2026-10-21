// TypeScript declaration for CSS side-effect and module imports
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
