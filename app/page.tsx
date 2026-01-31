import PinnedHorizontalScroll from "@/components/InfiniteLoopPanels";
import ParallaxImage from "@/components/ParallaxImage";


export default function Home() {
  return (
    <>
      <ParallaxImage src={"/About-1.jpeg"} alt={"Hero Image"}/>
      <PinnedHorizontalScroll />
    </>
  )
}
