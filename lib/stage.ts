export const STAGE = parseInt(process.env.NEXT_PUBLIC_STAGE || "1", 10);
export const isStageActive = (n: number) => STAGE >= n;
