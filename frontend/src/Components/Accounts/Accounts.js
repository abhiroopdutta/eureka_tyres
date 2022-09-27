import React, { useState, useEffect } from "react";
import { Layout, DatePicker, Typography, Button, Col, Row, Modal, Form, Input, Select } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { dayjsLocal } from "../dayjsUTCLocal";
import HeaderContainer from "./HeaderContainer";
const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

function Accounts() {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [headers, setHeaders] = useState([]);
    const [headersUpdated, setHeadersUpdated] = useState(false);
    const [paymentModes, setPaymentModes] = useState(["cash", "card", "UPI", "bankTransfer"]);

    useEffect(() => {
        let didCancel = false; // avoid fetch race conditions or set state on unmounted components
        async function fetchHeaders() {

            const requestOptions = {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            };
            try {
                const response = await fetch("/api/get_headers", requestOptions);
                const result = await response.json();
                if (response.ok && !didCancel) {
                    setHeaders(result);
                }
            } catch (err) {
                if (!didCancel) {
                    Modal.error({
                        content: err.message,
                    });
                    console.log(err.message);
                }
            }
        }
        fetchHeaders();
        return () => {
            didCancel = true;
        };
    }, [headersUpdated]);

    const closeModal = () => {
        setVisible(false);
    };
    const showModal = () => {
        setVisible(true);
    };

    const handleFilterPaymentModes = (changedFields, allFields) => {
        let fromFieldValue = allFields.find((field) => field.name[0] === "from")?.value;
        let toFieldValue = allFields.find((field) => field.name[0] === "to")?.value;
        let fromFieldType = headers.find(header => header.code === fromFieldValue)?.type;
        let toFieldType = headers.find(header => header.code === toFieldValue)?.type;
        if (fromFieldType === "cash" || toFieldType === "cash") {
            setPaymentModes(["cash"]);
            return;
        }
        else {
            setPaymentModes(["cash", "card", "UPI", "bankTransfer"]);
        }
    };

    return (
        <Layout
            style={{
                background: "var(--global-app-color)",
                maxWidth: "95%",
                margin: "44px auto",
            }}
        >
            <Row justify={"center"}>
                <Col>
                    <Button
                        onClick={showModal}
                        style={{ marginBottom: "40px" }}
                    >
                        + Add new transaction
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col>
                    <HeaderContainer headers={headers} setHeadersUpdated={setHeadersUpdated} />
                </Col>
                <Col>

                </Col>
            </Row>

            <Modal
                visible={visible}
                centered
                destroyOnClose
                onCancel={closeModal}
                footer={null}
                title="Add new transaction"
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
                        onFinish={handleAddTransaction}
                        autoComplete="off"
                        initialValues={{ remember: false, status: "paid", description: "" }}
                        onFieldsChange={handleFilterPaymentModes}
                    >
                        <Form.Item
                            label="From"
                            name="from"
                            rules={[{ required: true, message: 'Please select one!' }]}
                        >
                            <Select >
                                {headers.map((header) =>
                                    <Option key={header.code} value={header.code}>{header.name}</Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="To"
                            name="to"
                            rules={[{ required: true, message: 'Please select one!' }]}
                        >
                            <Select >
                                {headers.map((header) =>
                                    <Option key={header.code} value={header.code}>{header.name}</Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="Amount"
                            name="amount"
                            rules={[{ required: true, message: 'Please input transaction amount!' }]}
                        >
                            <Input placeholder="ex - Rs 500/-" type="number" min="1" step="1" addonBefore="&#8377;" />
                        </Form.Item>
                        <Form.Item
                            label="Date Time"
                            name="datetime"
                            rules={[{ required: true, message: 'Please input transaction datetime!' }]}
                        >
                            <DatePicker
                                format="YYYY-MM-DD HH:mm:ss"
                                showTime={true}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Payment Mode"
                            name="paymentMode"
                            rules={[{ required: true, message: 'Please select one!' }]}
                        >
                            <Select
                            >
                                {paymentModes.map((paymentMode) =>
                                    <Option key={paymentMode} value={paymentMode}>{paymentMode}</Option>
                                )}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="Status"
                            name="status"
                            rules={[{ required: true, message: 'Please select one!' }]}
                        >
                            <Select >
                                <Option value="paid">paid</Option>
                                <Option value="due">due</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Description"
                            name="description"
                            rules={[{ required: false }]}
                        >
                            <TextArea rows={4} />
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 8, span: 16 }} style={{
                            margin: "0",
                        }}>
                            <Button loading={loading} type="primary" htmlType="submit">
                                Add transaction
                            </Button>
                        </Form.Item>
                    </Form>

                </Layout>
            </Modal>
        </Layout>
    );
}

export default Accounts;
