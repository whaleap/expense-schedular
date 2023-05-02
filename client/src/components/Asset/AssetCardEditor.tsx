import React, { useEffect, useState } from 'react';
import { ASSET_CARD_DETAIL_TYPE, DetailTablValueType } from '../../constants/type';
import { useAppSelector } from '../../hooks/redux-hook';
import { AssetDataType, CardDataType } from '../../util/api/assetAPI';
import Button from '../UI/Button';
import ConfirmCancelButtons from '../UI/ConfirmCancelButtons';
import DraggableItem from '../UI/DraggableItem';
import DraggableList from '../UI/DraggableList';
import Icon from '../UI/Icon';
import Overlay from '../UI/Overlay';
import classes from './AssetCardEditor.module.css';
import DetailTypeTab from './DetailTypeTab';

interface AssetCardEditorProps {
  isAsset: boolean;
  showAll?: boolean;
  isOpen: boolean;
  closeEditor: () => void;
}

const AssetCardEditor = ({ isAsset, isOpen, closeEditor }: AssetCardEditorProps) => {
  const list: (AssetDataType | CardDataType)[] = useAppSelector((state) =>
    isAsset ? state.asset.assets : state.asset.cards
  );

  const [detailState, setDetailState] = useState<DetailTablValueType>('all');
  const [listState, setListState] = useState(list);

  // Set detail state
  useEffect(() => {
    if (isOpen) {
      setDetailState('all');
    }
  }, [isOpen]);

  // Set list data
  useEffect(() => {
    setListState(list);
  }, [isAsset]);

  useEffect(() => {
    if (detailState === 'all') {
      setListState(list);
    } else {
      const filteredList = list.filter((item) => item.detail === detailState);
      setListState(filteredList);
    }
  }, [detailState]);

  /** 자산/카드 목록 수정사항 제출 */
  const submitHandler = async (event: React.FormEvent) => {
    event.preventDefault();
  };

  /** 해당 자산/카드 편집 오버레이 열기 */
  const editHandler = (idx: number) => {};

  /** 해당 자산/카드 삭제하여 paymentState에 반영 */
  const removeHandler = (idx: number) => {};

  return (
    <Overlay isOpen={isOpen} closeHandler={closeEditor} className={classes.container}>
      <h2>{isAsset ? '자산' : '카드'} 편집</h2>
      <DetailTypeTab
        id={isAsset ? 'asset-detail-type-tab' : 'card-detail-type-tab'}
        className={classes.tab}
        isAsset={isAsset}
        isAll={true}
        detailState={detailState}
        setDetailState={setDetailState}
      />
      <form onSubmit={submitHandler}>
        <div className={classes.content}>
          <DraggableList
            id="payment-editor-list"
            list={listState}
            setList={setListState}
            className={classes.list}
          >
            {/* TODO: filter by item.type */}
            {listState.map((item, i) => (
              <DraggableItem
                key={item._id}
                id={item._id}
                idx={i}
                className={classes.item}
                onEdit={editHandler}
                onRemove={removeHandler}
              >
                <div className={classes.data}>
                  <Icon className={classes.icon}>{item.icon}</Icon>
                  <div className={classes.info}>
                    <span className={classes.detail}>
                      {ASSET_CARD_DETAIL_TYPE[item.detail]}
                    </span>
                    <span className={classes.title}>{item.title}</span>
                  </div>
                </div>
              </DraggableItem>
            ))}
          </DraggableList>
        </div>
        <Button className={classes.add} styleClass="extra">
          자산 및 결제수단 추가하기
        </Button>
        <ConfirmCancelButtons onClose={closeEditor} />
      </form>
    </Overlay>
  );
};

export default AssetCardEditor;
