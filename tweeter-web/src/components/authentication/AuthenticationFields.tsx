interface Props {
    onKeyDownEvent: React.KeyboardEventHandler<HTMLElement>;
    setAlias: React.Dispatch<React.SetStateAction<string>>;
    setPassword: React.Dispatch<React.SetStateAction<string>>;
    bottomClass?: boolean;
}

const AuthenticationFields = (props: Props) => {
    return (
      <>
        <div className="form-floating">
          <input
            type="text"
            className="form-control"
            size={50}
            id="aliasInput"
            aria-label="alias"
            placeholder="name@example.com"
            onKeyDown={props.onKeyDownEvent}
            onChange={(event) => props.setAlias(event.target.value)}
          />
          <label htmlFor="aliasInput">Alias</label>
        </div>
        <div className={props.bottomClass ? "form-floating mb-3" : "form-floating"}>
          <input
            type="password"
            className={props.bottomClass ? "form-control bottom" : "form-control"} 
            id="passwordInput"
            placeholder="Password"
            aria-label="password"
            onKeyDown={props.onKeyDownEvent}
            onChange={(event) => props.setPassword(event.target.value)}
          />
          <label htmlFor="passwordInput">Password</label>
        </div>
      </>
    );
}

export default AuthenticationFields;