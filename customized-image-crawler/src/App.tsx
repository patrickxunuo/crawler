import "./App.css";
import { useCallback, useState } from "react";
import { Action, LogItem } from "./types/main";
import {
  Button,
  Input,
  List,
  Popconfirm,
  Typography,
  Image,
  Space,
  Spin,
} from "antd";
import { cloneDeep, isEmpty } from "lodash";
import ActionForm from "./components/ActionForm.tsx";
// @ts-ignore
import { v4 as uuidv4 } from "uuid";
import { getScreenshot, testAction } from "./request.ts";
import useLoading from "@patrickxu/use-loading";

const { Text, Paragraph } = Typography;

function App() {
  const [formVisible, setFormVisible] = useState(false);
  const [actionList, setActionList] = useState<Action[]>([]);
  const [selectedAction, setSelectedAction] = useState<Action>();
  const [targetUrl, setTargetUrl] = useState("");
  const [screenshot, setScreenshot] = useState(undefined);
  const [log, setLog] = useState<LogItem[]>([]);
  const { groupHandler, isLoading } = useLoading();

  const handleSubmit = async (values: any) => {
    try {
      setActionList((list) => {
        if (selectedAction) {
          const copyList = cloneDeep(list);
          const index = copyList.findIndex((item) => item.id === values.id);
          copyList[index].type = values.type;
          copyList[index].targetId = values.targetId;
          copyList[index].value = values.value;
          copyList[index].addDelay = values.addDelay;
          copyList[index].delay = values.delay;
          return copyList;
        }
        return [...list, { ...values, id: uuidv4() }];
      });
      setFormVisible(false);
      setSelectedAction(undefined);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = (id: string) => {
    setActionList((list) => {
      const copyList = cloneDeep(list);
      const index = copyList.findIndex((item) => item.id === id);
      if (index !== -1) {
        copyList.splice(index, 1);
      }
      return copyList;
    });
  };

  const handleGetScreenShot = useCallback(
    groupHandler(async () => {
      try {
        const response = await getScreenshot(targetUrl);
        setScreenshot(response.data?.screenshot);
      } catch (error) {
        console.error("Failed to fetch screenshot:", error);
      }
    }),
    [targetUrl],
  );

  const handleTestAction = useCallback(
    groupHandler(async () => {
      try {
        const socket = new WebSocket("ws://localhost:3002/test-actions/ws");
        socket.onopen = () => {
          console.log("WebSocket connection opened");
          setLog([]);
        };
        socket.onmessage = (event) => {
          console.log("Received from server:", event.data);
          const date = new Date();
          setLog((log) => [
            ...log,
            {
              timestamp: date.toLocaleTimeString(),
              detail: event.data,
            },
          ]);
        };
        socket.onclose = () => {
          console.log("WebSocket connection closed");
        };

        const response = await testAction(targetUrl, actionList);
        setScreenshot(response.data?.screenshot);
      } catch (error) {
        console.error("Failed to fetch screenshot:", error);
      }
    }),
    [targetUrl, actionList],
  );

  return (
    <Spin spinning={isLoading}>
      <div className="container">
        <section>
          <Space style={{ width: "100%" }}>
            <Text>Target URL:</Text>
            <Input
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
            />
            <Button onClick={handleGetScreenShot} disabled={!targetUrl}>
              Get Screen Shot
            </Button>
          </Space>
          <Space>
            <Button onClick={() => setFormVisible(true)}>Add Action</Button>
            <Button
              onClick={handleTestAction}
              disabled={isEmpty(actionList) || !targetUrl}
            >
              Test Actions
            </Button>
          </Space>
          {isEmpty(actionList) ? (
            <Text>No Action will be performed, please add some actions</Text>
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={actionList}
              renderItem={(item, index) => (
                <List.Item
                  actions={[
                    <a
                      key="list-loadmore-edit"
                      onClick={() => {
                        setSelectedAction(item);
                        setFormVisible(true);
                      }}
                    >
                      Edit
                    </a>,
                    <Popconfirm
                      title="Are you sure?"
                      onConfirm={() => handleDelete(item.id)}
                    >
                      <a key="list-loadmore-more">Delete</a>
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    title={`第 ${index + 1} 步`}
                    description={`${
                      item.type === "CLICK"
                        ? `Click on #${item.targetId}`
                        : `Select #${item.targetId} to value ${item.value}`
                    }, ${
                      item.addDelay ? `and delay ${item.delay} ms` : "no delay"
                    }`}
                  />
                </List.Item>
              )}
            />
          )}
          <ActionForm
            visible={formVisible}
            onSubmit={handleSubmit}
            onCancel={() => setFormVisible(false)}
            selectedAction={selectedAction}
          />
        </section>
        <section>
          <ul>
            {log.map((l, index) => (
              <li
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                }}
              >
                <Text strong style={{ width: 80 }}>
                  {l.timestamp}
                </Text>
                <Paragraph style={{ width: "calc(100% - 80px)" }}>
                  {l.detail}
                </Paragraph>
              </li>
            ))}
          </ul>
        </section>
        <section>
          {screenshot && (
            <Image
              src={`data:image/png;base64,${screenshot}`}
              alt="Screenshot"
            />
          )}
        </section>
      </div>
    </Spin>
  );
}

export default App;
