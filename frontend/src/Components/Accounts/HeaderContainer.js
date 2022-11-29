import React, { useContext, useState, useEffect } from "react";
import styles from "./HeaderContainer.module.css";
import { message, Modal, Form, Input, Layout, Select, Button } from "antd";
import { SearchOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { dayjsUTC } from "../dayjsUTCLocal";

const { Option } = Select;

function HeaderContainer({ headers, setHeadersUpdated, selectedHeader, setSelectedHeader }) {

    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isActiveHeader, setIsActiveHeader] = useState(false);

    const closeModal = () => {
        setVisible(false);
    };
    const showModal = () => {
        setVisible(true);
    };


    const handleAddHeader = (new_header) => {
        setLoading(true);

        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(new_header),
        };

        const submit_item = async () => {
            try {
                const response = await fetch("api/add_header", requestOptions);
                if (response.ok) {
                    setTimeout(() => {
                        setLoading(false);
                    }, 500);
                    setTimeout(() => setVisible(false), 800);
                    setTimeout(() => setHeadersUpdated((oldState) => !oldState), 800);
                }
            } catch (err) {
                console.log(err.message);
            }
        };
        submit_item();
    };

    const handleSetSelectedHeader = (header) => {
        setSelectedHeader(header);
    };

    return (
        <div className={styles["entities-container"]}>
            <header>
                <div className={styles["entities-header"]}>
                    <h5 className={styles["entities-title"]}>Headers</h5>
                    <Button
                        className={styles["add-entity-btn"]}
                        onClick={showModal}
                        type="default"
                    >+</Button>

                </div>
                <div className={styles["entities-search"]}>
                    <label htmlFor="search-box"></label>
                    <input id="search-box" type="text" placeholder="Find or search headers" />
                    <SearchOutlined />
                </div>
            </header>


            <section className={styles["entities-section-container"]}>
                <div className={styles["entities"]}>
                    {headers.map((header) => (
                        <div key={header.code}>
                            <div
                                className={selectedHeader?.code === header.code ?
                                    `${styles["entity-container"]} ${styles["active"]}` :
                                    `${styles["entity-container"]}`
                                }
                                onClick={() => handleSetSelectedHeader(header)}>
                                <h4>{header.name}</h4>
                                <InfoCircleOutlined className={styles["info-icon"]} />
                            </div>
                        </div>
                    ))}

                </div>
            </section>
            <Modal
                visible={visible}
                centered
                destroyOnClose
                onCancel={closeModal}
                footer={null}
                title="Add Header"
                bodyStyle={{
                    backgroundColor: "var(--lighter)",
                    borderRadius: "12px"
                }}
            >
                <Layout
                    style={{
                        margin: "15px auto",
                    }}
                >
                    <Form
                        name="basic"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        onFinish={handleAddHeader}
                        autoComplete="off"
                        initialValues={{ remember: false, headerType: "regular" }}
                    >
                        <Form.Item
                            label="Header Name"
                            name="headerName"
                            rules={[{ required: true, message: 'Please input header name!' }]}
                        >
                            <Input placeholder="ex - Electricity/Rent" />
                        </Form.Item>

                        <Form.Item
                            label="Header Type"
                            name="headerType"
                            rules={[{ required: true, message: 'Please input header type!' }]}
                        >
                            <Select style={{ width: 120 }}>
                                <Option value="cash">Cash</Option>
                                <Option value="bank">Bank</Option>
                                <Option value="regular">Regular</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 8, span: 16 }} style={{
                            margin: "0",
                        }}>
                            <Button loading={loading} type="primary" htmlType="submit">
                                Add header
                            </Button>
                        </Form.Item>
                    </Form>

                </Layout>
            </Modal>
        </div>

    );
}

export default HeaderContainer;
