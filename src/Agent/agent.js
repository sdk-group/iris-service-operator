'use strict'

let emitter = require("global-queue");
let EmployeeApi = require("resource-management-framework").EmployeeApi;

class Agent {
	constructor() {
		this.emitter = emitter;
	}

	init() {
		this.iris = new EmployeeApi();
		this.iris.initContent();
	}

	//API
	actionChangeState({
		user_id: emp_id,
		state: state
	}) {
		return this.iris.setEmployeeField({
			keys: [emp_id]
		}, {
			state: state
		});
	}

	actionLogin({
		user_id
	}) {
		return this.actionChangeState({
			user_id, state: 'active'
		});
	}

	actionLogout({
		user_id
	}) {
		return this.actionChangeState({
			user_id, state: 'inactive'
		});
	}

	actionPause({
		user_id
	}) {
		return this.actionChangeState({
			user_id, state: 'paused'
		});
	}

	actionResume({
		user_id
	}) {
		return this.actionChangeState({
			user_id, state: 'active'
		});
	}

	actionInfo({
		user_id: emp_id
	}) {
		return Promise.props({
				employee: this.iris.getEmployee({
					keys: [emp_id]
				}),
				roles: this.iris.getEmployeeRoles(emp_id)
			})
			.then(({
				employee, roles
			}) => {
				// console.log("EMPLOYEE", require('util').inspect(employee, {
				// 	depth: null
				// }));
				return this.emitter.addTask('workstation', {
						_action: 'workstation',
						data: {
							query: {
								allows_role: _.map(roles, 'role')
							}
						}
					})
					.then((wp) => {
						return {
							employee, roles, wp
						};
					});
			});
	}

	actionWorkstation({
		user_id: emp_id
	}) {
		return this.emitter.addTask('workstation', {
			_action: 'workstation',
			data: {
				query: {
					occupied_by: emp_id
				}
			}
		});
	}
	actionDefaultWorkstation({
		user_id: emp_id
	}) {
		return this.emitter.addTask('workstation', {
			_action: 'workstation',
			data: {
				query: {
					device_of: emp_id
				}
			}
		});
	}
	actionAvailableWorkstations({
		user_id: emp_id
	}) {
		return this.iris.getEmployeeRoles(emp_id)
			.then((roles) => {
				// console.log("EMPLOYEE", require('util').inspect(employee, {
				// 	depth: null
				// }));
				return this.emitter.addTask('workstation', {
					_action: 'workstation',
					data: {
						query: {
							allows_role: _.map(roles, 'role')
						}
					}
				});
			});
	}
}

module.exports = Agent;