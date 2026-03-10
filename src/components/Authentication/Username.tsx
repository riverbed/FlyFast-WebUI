import { useSearchParams } from "react-router";

const Username = () => {
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username") ?? "";

  return (
    <span id="shellUser-name" className="sapUiUfdShellHeadUsrItmName" title={username}>
      {username}
    </span>
  );
};

export default Username;
