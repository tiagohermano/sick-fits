import Reset from '../components/Reset';

export default function ResetPage(props) {
  return (
    <div>
      <Reset resetToken={props.query.resetToken}/>
    </div>
  );
}
