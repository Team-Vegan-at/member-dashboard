/* eslint-disable react/jsx-no-comment-textnodes */
import React, { Component } from 'react';

import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';
import { Dropdown } from 'primereact/dropdown';
import { Tooltip } from 'primereact/tooltip';

import { MembersService } from '../services/MembersService';

export class Dashboard extends Component {

    constructor() {
        super();
        this.state = {
            loading: true,
            selectedPaymentState: null,
            selectedSubscriptionState: null,
            selectedDiscourseState: null,
            paymentState: [
                { label: 'Paid', value: 'true' },
                { label: 'Not Paid', value: 'false' },
            ],
            subscriptionState: [
                { label: 'Yes', value: 'true' },
                { label: 'No', value: 'false' },
            ],
            discourseState: [
                { label: 'Active', value: 'active' },
                { label: 'Suspended', value: 'suspended' },
                { label: 'Not signed up', value: 'na' },
            ],
            selectedDiscourseId: null,
        };
        this.onPaymentStatusChange = this.onPaymentStatusChange.bind(this);
        this.onSubscriptionStatusChange = this.onSubscriptionStatusChange.bind(this);
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

    onSubscriptionStatusChange(event) {
        this.dt.filter(event.value, 'activeSubscription', 'equals');
        this.setState({selectedSubscriptionState: event.value});
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

    subscriptionStatusTemplate(rowData, column) {
        if (rowData['subscription'] && Object.keys(rowData['subscription']).length > 0) {
            return <i className="pi pi-check"/>
        } else {
            return <i className="pi pi-times"/>
        }
    }

    dateTemplate(rowData, column) {
        if (rowData['payment'] && Object.keys(rowData['payment']).includes('paidAt')) {
            let dateFormat = rowData['payment']['paidAt'];
            if (dateFormat) {
                dateFormat = dateFormat.substr(0, 10);
            }
            return dateFormat;
        } else {
            return <p></p>
        }
    }

    discourseStatusTemplate(rowData, column) {
        if (!rowData['discourse']['id']) {
            return (
                <div>
                    <Tooltip target=".noUserClass" position="left" />
                    <i className="pi pi-user-minus noUserClass"
                      data-pr-tooltip="Not registered in forum" />
                </div>
            );
        } else if (rowData['discourse']['suspended_at']) {
            return ( 
                <div>
                    <Tooltip target=".forumSuspendedClass" position="left" />
                    <i className="pi pi-times forumSuspendedClass"
                        data-pr-tooltip="Forum user suspended" />
                </div>
            );
        } else {
            return (
                <div>
                    <Tooltip target=".forumActiveClass" position="left" />
                    <i className="pi pi-check forumActiveClass"
                        data-pr-tooltip="Forum user active" />
                </div>
            );
        }
    }

    actionsMollieTemplate(rowData, column) {
        return ( 
            <div>
                <Tooltip target=".actionsClass" position="left" />
                <a  target="_blank"
                    rel="noreferrer"
                    href={ `https://www.mollie.com/dashboard/org_7157271/customers/${rowData.mollieCustId}` }
                    alt="Open in Mollie"
                    data-pr-tooltip="Open in Mollie"
                    className="actionsClass"
                >
                    <img src="./mollie.png" alt="Mollie logo" style={{ width: 50 + 'px' }} />
                </a>                        
            </div>
        );
    }

    actionsDiscourseTemplate(rowData, column) {
        if (!rowData['discourse']['id']) {
        } else if (rowData['discourse']['suspended_at']) {
            return ( 
                <div>
                    <Button className="p-button-success p-button-raised p-button-rounded" 
                            icon="pi pi-unlock" type="button" tooltip="Unsuspend forum user" 
                            tooltipOptions={{ position: "left" }}
                            onClick={() => this.unsuspend(rowData['discourse']['id'])}/>
                </div>
            );
        } else {
            return (
                <div>
                    <Button className="p-button-danger p-button-raised p-button-rounded" 
                            icon="pi pi-lock" type="button" tooltip="Suspend forum user" 
                            tooltipOptions={{ position: "left" }}
                            onClick={() => this.suspend(rowData['discourse']['id'])}/>
                </div>
            );
        }
    }

    render() {
        const paymentStateFilter =
            <Dropdown style={{width: '100%'}} placeholder="filter" 
                value={this.state.selectedPaymentState} options={this.state.paymentState} onChange={this.onPaymentStatusChange} showClear />;
        const subscriptionStateFilter =
            <Dropdown style={{width: '100%'}} placeholder="filter" 
                value={this.state.selectedSubscriptionState} options={this.state.subscriptionState} onChange={this.onSubscriptionStatusChange} showClear />;
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
                    <Column header={ `membership 2021` } colSpan={3} />
                    <Column header="forum" colSpan={2} />
                    <Column header="actions" rowSpan={2} colSpan={2} field="actions" />
                </Row>
                <Row>
                    <Column header="paid" field="paid" sortable />
                    <Column header="direct debit" field="activeSubscription" sortable />
                    <Column header="date" field="payment.paidAt" sortable />
                    <Column header="username" field="discourse.username" sortable />
                    <Column header="status" field="discourse.active" sortable />
                </Row>
                <Row>
                    <Column field="name"
                            filter
                            filterPlaceholder="filter"
                            filterMatchMode="contains" />

                    <Column field="email"
                            filter
                            filterPlaceholder="filter"
                            filterMatchMode="contains" />

                    <Column field="paid"
                            filter
                            filterElement={paymentStateFilter} />

                    <Column field="activeSubscription" 
                            filter
                            filterElement={subscriptionStateFilter}  />

                    <Column field="payment.paidAt"
                            filter
                            filterPlaceholder="filter"
                            filterMatchMode="contains"/>

                    <Column field="discourse.username" 
                            filter
                            filterPlaceholder="filter"
                            filterMatchMode="contains" />

                    <Column field="discourse"
                            filter
                            filterElement={discourseStateFilter} />

                    <Column field="actions" />
                </Row>
            </ColumnGroup>);

        return (
            <DataTable 
                value={this.state.members}
                sortField="payment.paidAt" sortOrder={-1}
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
                loading={this.state.loading}
                autoLayout={true}>

                <Column field="name" />
                <Column field="email" className="ellipsis" />

                <Column field="paid" body={this.paymentStatusTemplate} />
                <Column field="activeSubscription" body={this.subscriptionStatusTemplate} />
                <Column field="payment.paidAt" body={this.dateTemplate} />

                <Column field="discourse.username" className="ellipsis" />
                <Column field="discourse.active" body={this.discourseStatusTemplate.bind(this)} />

                <Column field="actionsMollie" body={this.actionsMollieTemplate.bind(this)} />
                <Column field="actionsDiscourse" body={this.actionsDiscourseTemplate.bind(this)} />
            </DataTable>
        );
    }
}
