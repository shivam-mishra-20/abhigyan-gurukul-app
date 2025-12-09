import { ImageSourcePropType } from "react-native";

export interface SlideData {
  id: string;
  type: "content" | "login";
  image?: ImageSourcePropType;
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
}

export const slides: SlideData[] = [
  {
    id: "1",
    type: "content",
    image: require("../../assets/images/logo.png"),
    title: "Welcome To\nAbhigyan Gurukul",
    subtitle:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt dolore magna aliqua",
    backgroundColor: "#FFFFFF",
  },
  {
    id: "2",
    type: "login",
    backgroundColor: "#FFFFFF",
  },
  
];
