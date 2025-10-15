import { Link } from "react-router-dom";
import { Status } from "tweeter-shared";
import { useUserNavigation } from "../userInfo/UserInfoHooks";
import Post from "./Post";

interface Props {
    status: Status;
    featurePath: string;
}

const StatusItem = (props: Props) => {
  const { navigateToUser } = useUserNavigation(props.featurePath);

  return (
    <div className="col bg-light mx-0 px-0">
        <div className="container px-0">
            <div className="row mx-0 px-0">
                <div className="col-auto p-3">
                    <img
                        src={props.status.user.imageUrl}
                        className="img-fluid"
                        width="80"
                        alt="Posting user"
                    />
                </div>
                <div className="col">
                    <h2>
                        <b>
                            {props.status.user.firstName} {props.status.user.lastName}
                        </b>{" "}
                        -{" "}
                        <Link
                            to={`/feed/${props.status.user.alias}`}
                            onClick={navigateToUser}
                        >
                            {props.status.user.alias}
                        </Link>
                    </h2>
                    {props.status.formattedDate}
                    <br />
                    <Post status={props.status} featurePath={props.featurePath} />
                </div>
            </div>
        </div>
    </div>
  );

};

export default StatusItem;