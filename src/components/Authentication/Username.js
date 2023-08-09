import {
    useSearchParams
  } from "react-router-dom"
  
  const Username = () => {
    const [searchParams] = useSearchParams();
    return (
      <span id="shellUser-name" class="sapUiUfdShellHeadUsrItmName" title={searchParams.get('username')}>{searchParams.get('username')}</span>
    );
  }
  
  export default Username;
  