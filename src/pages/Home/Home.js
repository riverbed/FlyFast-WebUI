import { Button } from "@mantine/core";

const Home = () => {

  function handleClick(e) {
    e.preventDefault();
    let url = "http://localhost:8080/searchflight?from=JFK&to=LAX";
    fetch(url)
      .then(res => res)
      .then(
        (result) => {
          console.log(result)
        }
      )
  }

  return (
    <>
      <Button variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }}
        onClick={(e) => handleClick(e)}
      >
        Click Me!
      </Button>
    </>
  );
}

export default Home;