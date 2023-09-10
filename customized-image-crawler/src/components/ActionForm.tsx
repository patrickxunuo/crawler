import {
  ModalForm,
  ProFormCheckbox,
  ProFormDependency,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { Action } from "../types/main";
import { useMemo } from "react";

interface ActionFormProps {
  visible: boolean;
  onSubmit: (formData: Record<string, never>) => Promise<boolean | void>;
  onCancel: () => void;
  selectedAction: Action | undefined;
  actions: Action[];
}

const ActionForm = ({
  visible,
  onSubmit,
  onCancel,
  selectedAction,
  actions,
}: ActionFormProps) => {
  const currentStep = useMemo(
    () =>
      selectedAction
        ? actions.findIndex((action) => action.id === selectedAction.id)
        : actions?.length + 1,
    [actions, selectedAction],
  );

  const targetOptions = useMemo(() => {
    return actions
      ?.filter((action) => action.type === "GET_OPTIONS")
      .map((action) => ({
        label: action.optionName,
        value: action.optionName,
      }));
  }, [actions]);

  return (
    <ModalForm
      open={visible}
      onFinish={onSubmit}
      modalProps={{
        width: 500,
        centered: true,
        onCancel,
        destroyOnClose: true,
      }}
      initialValues={selectedAction}
      title={`第 ${currentStep} 步`}
    >
      <ProFormText name="id" hidden />
      <ProFormSelect
        name="type"
        label="Action Type"
        rules={[{ required: true }]}
        options={[
          { label: "Click", value: "CLICK" },
          { label: "Select", value: "SELECT" },
          { label: "Get Options", value: "GET_OPTIONS" },
          { label: "Create Loop", value: "LOOP" },
        ]}
      />
      <ProFormDependency name={["type"]}>
        {({ type }) => {
          return type === "LOOP" ? (
            <ProFormSelect
              name="targetOption"
              label="Target Option"
              options={targetOptions}
              rules={[{ required: true }]}
            />
          ) : (
            <ProFormText
              name="targetId"
              label="Target ID"
              rules={[{ required: true }]}
            />
          );
        }}
      </ProFormDependency>

      <ProFormDependency name={["type"]}>
        {({ type }) => {
          return type === "SELECT" ? (
            <ProFormText
              name="value"
              label="Pick Value"
              rules={[{ required: true }]}
            />
          ) : null;
        }}
      </ProFormDependency>
      <ProFormDependency name={["type"]}>
        {({ type }) => {
          return type === "GET_OPTIONS" ? (
            <ProFormText
              name="optionName"
              label="Option Name"
              rules={[{ required: true }]}
            />
          ) : null;
        }}
      </ProFormDependency>
      <ProFormCheckbox name="addDelay" label="Delay After Action" />
      <ProFormDependency name={["addDelay"]}>
        {({ addDelay }) => (
          <ProFormText
            disabled={!addDelay}
            name="delay"
            label="Delay in milliseconds"
          />
        )}
      </ProFormDependency>
    </ModalForm>
  );
};

export default ActionForm;
