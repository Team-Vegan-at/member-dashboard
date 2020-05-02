import React, { Component } from 'react';

import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';
import { Dropdown } from 'primereact/dropdown';

import { MembersService } from '../services/MembersService';

export class Dashboard extends Component {

    constructor() {
        super();
        this.state = {
            loading: true,
            selectedPaymentState: null,
            selectedDiscourseState: null,
            paymentState: [
                { label: 'Paid', value: 'true' },
                { label: 'Not Paid', value: 'false' },
            ],
            discourseState: [
                { label: 'Active', value: 'true' },
                { label: 'Blocked', value: 'false' },
                { label: 'Not signed up', value: 'na' },
            ]
        };
        this.onPaymentStatusChange = this.onPaymentStatusChange.bind(this);
        this.onDiscourseStatusChange = this.onDiscourseStatusChange.bind(this);

        this.service = new MembersService();
        this.export = this.export.bind(this);
    }

    componentDidMount() {
        this.service.getMembers().then(data => this.setState(
            {
                members: data,
                loading: false
            }
        ));
    }

    export() {
        this.dt.exportCSV();
    }

    onPaymentStatusChange(event) {
        this.dt.filter(event.value, 'paid', 'equals');
        this.setState({selectedPaymentState: event.value});
    }

    onDiscourseStatusChange(event) {
        if (event.value === 'na') {
            this.dt.filter(null, 'discourse', 'equals');
        } else {
            this.dt.filter(event.value, 'discourse.active', 'equals');
        }
        this.setState({selectedDiscourseState: event.value});
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
        // const paginatorLeft = <Button icon="pi pi-refresh"/>;
        const paymentStateFilter = <Dropdown style={{width: '100%'}} placeholder="filter" 
            value={this.state.selectedPaymentState} options={this.state.paymentState} onChange={this.onPaymentStatusChange} showClear />;
        const discourseStateFilter = <Dropdown style={{width: '100%'}} placeholder="filter" 
            value={this.state.selectedDiscourseState} options={this.state.discourseState} onChange={this.onDiscourseStatusChange} showClear />;

        const header = <div style={{textAlign:'left'}}>
                        <Button type="button" icon="pi pi-external-link" iconPos="left" label="CSV" onClick={this.export}/>
                    </div>;


        const headerGroup = <ColumnGroup>
                            <Row>
                                <Column header="name" rowSpan={2} field="name" sortable />
                                <Column header="email" rowSpan={2} field="email" sortable />
                                <Column header="paid" rowSpan={2} field="paid" />
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
                            <Row>
                                <Column field="name" filter filterPlaceholder="filter" />
                                <Column field="email" filter filterPlaceholder="filter" />
                                <Column field="paid" filter filterElement={paymentStateFilter} />
                                <Column />
                                <Column />
                                <Column />
                                <Column />
                                <Column field="discourse.username" filter filterPlaceholder="filter" />
                                <Column field="discourse" filter filterElement={discourseStateFilter} />
                            </Row>
                        </ColumnGroup>;

        return (
            <DataTable 
                value={this.state.members}
                paginator
                responsive
                // paginatorLeft={paginatorLeft}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                rows={25}
                rowsPerPageOptions={[10,25,50,100,500]}
                header={header}
                headerColumnGroup={headerGroup}
                ref={(el) => { this.dt = el; }}
                emptyMessage="No records found"
                loading={this.state.loading}>

                <Column field="name" />
                <Column field="email" className="ellipsis" />
                <Column field="paid" body={this.paymentStatusTemplate} />

                <Column field="payment.method" />
                <Column field="payment.paidAt" />
                <Column field="payment.amount" />
                <Column field="payment.payerName" />

                <Column field="discourse.username" className="ellipsis" />
                <Column field="discourse.active" body={this.discourseStatusTemplate} />
            </DataTable>
        );
    }
}
