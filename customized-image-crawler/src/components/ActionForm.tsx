import {
  ModalForm,
  ProFormCheckbox,
  ProFormDependency,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { Action } from "../types/main";

interface ActionFormProps {
  visible: boolean;
  onSubmit: (formData: Record<string, never>) => Promise<boolean | void>;
  onCancel: () => void;
  selectedAction: Action | undefined;
}

const ActionForm = ({
  visible,
  onSubmit,
  onCancel,
  selectedAction,
}: ActionFormProps) => {
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
    >
      <ProFormText name="id" hidden />
      <ProFormSelect
        name="type"
        label="Action Type"
        options={[
          { label: "Click", value: "CLICK" },
          { label: "Select", value: "SELECT" },
        ]}
      />
      <ProFormText name="targetId" label="Target ID" />
      <ProFormDependency name={["type"]}>
        {({ type }) => {
          return type === "SELECT" ? (
            <ProFormText name="value" label="Pick Value" />
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
