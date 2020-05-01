import React, { Component } from 'react';

import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';

import { MembersService } from '../services/MembersService';

export class Dashboard extends Component {

    constructor() {
        super();
        this.state = {};
        this.service = new MembersService();
        this.export = this.export.bind(this);
    }

    componentDidMount() {
        this.service.getMembers().then(data => this.setState({members: data}));
    }

    export() {
        this.dt.exportCSV();
    }

    paymentStatusTemplate(rowData, column) {
        if (rowData['paid'] === true) {
            return <i className="pi pi-check"></i>
        } else {
            return <i className="pi pi-times"></i>
        }
    }

    discourseStatusTemplate(rowData, column) {
        if (rowData['discourse']['active'] === true) {
            return <i className="pi pi-check"></i>
        } else {
            return <i className="pi pi-times"></i>
        }
    }

    render() {
        let header = <div style={{textAlign:'left'}}>
                        <Button type="button" icon="pi pi-external-link" iconPos="left" label="CSV" onClick={this.export}/>
                    </div>;

        let headerGroup = <ColumnGroup>
                            <Row>
                                <Column header="name" rowSpan={2} field="name" sortable />
                                <Column header="email" rowSpan={2} field="email" sortable />
                                <Column header="paid" rowSpan={2} field="paid" sortable />
                                <Column header="payment" colSpan={4} />
                                <Column header="forum" colSpan={2} />
                            </Row>
                            <Row>
                                <Column header="method" field="payment.method" sortable />
                                <Column header="date" field="payment.date" sortable />
                                <Column header="amount" field="payment.amount" sortable />
                                <Column header="payer" field="payment.payerName" sortable />

                                <Column header="username" field="discourse.username" sortable />
                                <Column header="active" field="discourse.active" sortable />
                            </Row>
                        </ColumnGroup>;

        return (
            <DataTable 
                value={this.state.members}
                header={header}
                headerColumnGroup={headerGroup}
                ref={(el) => { this.dt = el; }}>
                <Column field="name" />
                <Column field="email" style={
                    { textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden'
                    }} />
                <Column field="paid" body={this.paymentStatusTemplate} />

                <Column field="payment.method" />
                <Column field="payment.paidAt" />
                <Column field="payment.amount" />
                <Column field="payment.payerName" />

                <Column field="discourse.username" />
                <Column field="discourse.active" body={this.discourseStatusTemplate} />
            </DataTable>
        );
    }
}
