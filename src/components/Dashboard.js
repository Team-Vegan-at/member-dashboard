/* eslint-disable react/jsx-no-comment-textnodes */
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
                { label: 'Active', value: 'active' },
                { label: 'Suspended', value: 'suspended' },
                { label: 'Not signed up', value: 'na' },
            ],
            selectedDiscourseId: null,
        };
        this.onPaymentStatusChange = this.onPaymentStatusChange.bind(this);
        this.onDiscourseStatusChange = this.onDiscourseStatusChange.bind(this);
        
        this.service = new MembersService();
        this.export = this.export.bind(this);
        // this.suspend = this.suspend.bind(this);
    }

    componentDidMount() {
        this.setState({ loading: true });
        this.service.getMembers().then(data => this.setState(
            {
                members: data,
                loading: false
            }
        ));
    }

    suspend(userId) {
        this.loading = true;
        this.service.suspendMember(userId).then(data => this.setState({
            loading: false
        }))
    }

    unsuspend(userId) {
        this.loading = true;
        this.service.unsuspendMember(userId).then(data => this.setState({
            loading: false
        }))
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
            this.dt.filter(null, 'discourse.id', 'equals');
        } else if (event.value === 'suspended') {
            this.dt.filter(null, 'discourse.suspended_at', 'equals');
        } else {
            this.dt.filter("*.", 'discourse.suspended_at', 'equals');
        }
        this.setState({selectedDiscourseState: event.value});
    }

    paymentStatusTemplate(rowData, column) {
        if (rowData['paid'] === true) {
            return <i className="pi pi-check"/>
        } else {
            return <i className="pi pi-times"/>
        }
    }

    discourseStatusTemplate(rowData, column) {
        if (!rowData['discourse']['id']) {
            return <i class="pi pi-user-minus" />
        } else if (rowData['discourse']['suspended_at']) {
            return ( 
                <div>
                    <i className="pi pi-times"/>
                    <Button className="p-button-success p-button-raised p-button-rounded" icon="pi pi-unlock" type="button" tooltip="Unsuspend user" onClick={() => this.unsuspend(rowData['discourse']['id'])}/>
                </div>
            );
        } else {
            return (
                <div>
                    <i className="pi pi-check"/>
                    <Button className="p-button-danger p-button-raised p-button-rounded" icon="pi pi-lock" type="button" tooltip="Suspend user" onClick={() => this.suspend(rowData['discourse']['id'])}/>
                </div>
            );
        }
    }

    render() {
        const paymentStateFilter =
            <Dropdown style={{width: '100%'}} placeholder="filter" 
                value={this.state.selectedPaymentState} options={this.state.paymentState} onChange={this.onPaymentStatusChange} showClear />;
        const discourseStateFilter =
            <Dropdown style={{width: '100%'}} placeholder="filter" 
                value={this.state.selectedDiscourseState} options={this.state.discourseState} onChange={this.onDiscourseStatusChange} showClear />;

        const header = (
            <div style={{textAlign:'left'}}>
                <Button type="button" icon="pi pi-external-link" iconPos="left" label="CSV" onClick={this.export}/>
            </div>);


        const headerGroup = (
            <ColumnGroup>
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
                    <Column header="status" field="discourse.active" sortable />
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
            </ColumnGroup>);

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
                <Column field="discourse.active" body={this.discourseStatusTemplate.bind(this)} />
            </DataTable>
        );
    }
}
