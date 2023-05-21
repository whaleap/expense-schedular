import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useAppDispatch } from '../hooks/redux-hook';
import { uiActions } from '../store/ui';

type SocialAuthMsgType =
  | 'LOGIN_SUCCESS'
  | 'REGISTER_SUCCESS'
  | 'CONNECT_SUCCESS'
  | 'EMAIL_IN_USE'
  | 'CONNECTED_ALREADY'
  | 'CONNECT_FAILED_SNSID_IN_USE' // SNSID_IN_USE
  | 'AT_LEAST_ONE_SNSID_IS_REQUIRED';

const Redirect = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [params] = useSearchParams();
  const snsLoginMsg: SocialAuthMsgType = params.get('message') as SocialAuthMsgType;

  const containerStyle = {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  // 소셜 로그인 -> 모달 팝업 & 리다이렉트
  useEffect(() => {
    switch (snsLoginMsg) {
      case 'LOGIN_SUCCESS':
      case 'REGISTER_SUCCESS':
        navigate('/budget');
        return;
      case 'EMAIL_IN_USE':
        dispatch(
          uiActions.showModal({
            title: '이미 사용 중인 이메일입니다',
            description: '이메일로 로그인 후 소셜 계정 연결을 진행해주세요.',
          })
        );
        navigate('/');
        break;
      case 'CONNECT_SUCCESS':
        dispatch(uiActions.showModal({ icon: '✓', title: '연결 완료' }));
        break;
      case 'CONNECTED_ALREADY':
        dispatch(uiActions.showModal({ description: '이미 연결된 소셜 계정입니다' }));
        break;
      case 'CONNECT_FAILED_SNSID_IN_USE':
        dispatch(
          uiActions.showModal({
            title: '다른 계정에서 사용중입니다',
            description: '다른 계정으로 시도해주세요',
          })
        );
        break;
      case 'AT_LEAST_ONE_SNSID_IS_REQUIRED':
        dispatch(
          uiActions.showModal({
            description: '최소 하나 이상의 로그인 수단이 필요합니다',
          })
        );
      default:
        dispatch(uiActions.showErrorModal());
        break;
    }

    navigate('/user');
  }, [snsLoginMsg]);

  return (
    <div style={containerStyle}>
      <LoadingSpinner />
    </div>
  );
};

export default Redirect;
