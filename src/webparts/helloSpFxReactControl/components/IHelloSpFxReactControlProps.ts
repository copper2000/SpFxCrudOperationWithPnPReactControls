import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IHelloSpFxReactControlProps {
  description: string;
  context: WebPartContext;
  webURL: string;
}
