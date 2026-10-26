import Hero from "./(section)/Hero"
import Features from "./(section)/Features"
import LandingSections from "./(section)/LandingSections"
import Menu from "./(section)/Menu"

export default function Page() {
  return (
    <main id="top">
      <Hero />
      <Features />
      <Menu />
      <LandingSections />
    </main>
  )
}
