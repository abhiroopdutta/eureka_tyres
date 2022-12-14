import React from "react";
import ServicesForm from "./ServicesForm";
import { Layout, Col, Row } from "antd";
import ServicesTable from "./ServicesTable";

function Services() {

    return (
        <Layout
            style={{
                maxWidth: "95%",
                margin: "44px auto ",
            }}
        >
            <Row gutter={30}>
                <Col lg={7}>
                    <ServicesForm />
                </Col>
                <Col flex={"auto"}>
                    <ServicesTable />
                </Col>
            </Row>

        </Layout>
    );
}

export default Services;
