import { useSearchParams } from "react-router-dom";

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
