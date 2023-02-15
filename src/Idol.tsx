export const QUESTIONS_PER_GAME = 11;
export const OPTIONS_PER_QUESTION = 4;

export type Idol = {
  stageName: string
  group: string | null
  gender: string
  imageLinks: string[] 
  id: string 
};

export type Question = {
  options: Idol[]
  correctId: string
}