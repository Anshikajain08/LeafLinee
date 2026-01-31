import Header from "@/components/Header";
import PinnedHorizontalScroll from "@/components/InfiniteLoopPanels";
import ParallaxImage from "@/components/ParallaxImage";


export default function Home() {
  return (
    <>
      <Header />
      <ParallaxImage src={"/Homepage-0.jpeg"} alt={"Hero Image"}/>
      <PinnedHorizontalScroll />
    </>
  )
}
