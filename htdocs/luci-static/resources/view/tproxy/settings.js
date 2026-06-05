'use strict';
'require view';
'require form';
'require fs';
'require ui';

function htmlEscape(s) {
	return String(s || '').replace(/[&<>"']/g, function(c) {
		return {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;'
		}[c];
	});
}

return view.extend({
	load: function() {
		return Promise.all([
			fs.exec_direct('/etc/init.d/tproxy', [ 'status' ]).catch(function() {
				return '';
			}),
			fs.exec_direct('/etc/init.d/tproxy', [ 'core_version' ]).catch(function(e) {
				return _('Unable to read kernel version: %s').format(e.message);
			}),
			fs.exec_direct('/etc/init.d/tproxy', [ 'logs' ]).catch(function() {
				return '';
			})
		]);
	},

	render: function(data) {
		var m, s, o;
		var status = (data[0] || '').trim();
		var coreVersion = (data[1] || '').trim();
		var logs = (data[2] || '').trim();

		m = new form.Map('tproxy', _('TProxy'), _('mihomo nftables TProxy configuration.'));

		s = m.section(form.TypedSection, 'tproxy', _('Service'));
		s.anonymous = true;

		o = s.option(form.Flag, 'enabled', _('Enable'));
		o.rmempty = false;

		o = s.option(form.DummyValue, '_status', _('Status'));
		o.rawhtml = true;
		o.cfgvalue = function() {
			if (status.indexOf('running') > -1)
				return '<span class="label success">' + _('Running') + '</span>';

			return '<span class="label warning">' + _('Stopped') + '</span>';
		};

		s = m.section(form.TypedSection, 'tproxy', _('Kernel information'));
		s.anonymous = true;

		o = s.option(form.Value, 'prog', _('Kernel path'));
		o.datatype = 'file';
		o.placeholder = '/usr/local/bin/mihomo';

		o = s.option(form.DummyValue, '_core_version', _('Version'));
		o.rawhtml = true;
		o.cfgvalue = function() {
			return '<pre style="white-space:pre-wrap;margin:0">' + htmlEscape(coreVersion || _('Unable to read kernel version')) + '</pre>';
		};

		s = m.section(form.TypedSection, 'tproxy', _('Policy routing'));
		s.anonymous = true;

		o = s.option(form.Value, 'fwmark', _('Firewall mark'));
		o.datatype = 'uinteger';
		o.placeholder = '1';

		o = s.option(form.Value, 'bypass_mark', _('Bypass mark'));
		o.datatype = 'uinteger';
		o.placeholder = '255';

		o = s.option(form.Value, 'route_dev', _('Local route device'));
		o.placeholder = 'lo';

		s = m.section(form.TypedSection, 'tproxy', _('IPv4 policy routing'));
		s.anonymous = true;

		o = s.option(form.Value, 'ipv4_table', _('IPv4 route table'));
		o.datatype = 'uinteger';
		o.placeholder = '100';

		o = s.option(form.Value, 'ipv4_rule_priority', _('IPv4 rule priority'));
		o.datatype = 'uinteger';
		o.placeholder = '32760';

		s = m.section(form.TypedSection, 'tproxy', _('IPv6 policy routing'));
		s.anonymous = true;

		o = s.option(form.Value, 'ipv6_table', _('IPv6 route table'));
		o.datatype = 'uinteger';
		o.placeholder = '101';

		o = s.option(form.Value, 'ipv6_rule_priority', _('IPv6 rule priority'));
		o.datatype = 'uinteger';
		o.placeholder = '32765';

		s = m.section(form.TypedSection, 'tproxy', _('Firewall'));
		s.anonymous = true;

		s.tab('general', _('General settings'));
		s.tab('interfaces', _('Interfaces'));
		s.tab('ports', _('Proxy ports'));
		s.tab('bypass', _('Bypass addresses'));

		o = s.taboption('general', form.Value, 'nft_file', _('Generated nft file'));
		o.datatype = 'file';
		o.placeholder = '/tmp/tproxy-port.nft';

		o = s.taboption('general', form.Value, 'tproxy_port', _('TProxy port'));
		o.datatype = 'port';
		o.placeholder = '12345';

		o = s.taboption('interfaces', form.Value, 'lan_ifaces', _('Listen interfaces'));
		o.placeholder = 'br-lan';

		o = s.taboption('interfaces', form.Value, 'bypass_ifaces', _('Bypass interfaces'));
		o.placeholder = 'eth0, pppoe-wan, wg';

		o = s.taboption('interfaces', form.Value, 'bypass_ports', _('Bypass ports'));
		o.placeholder = '54321';

		o = s.taboption('ports', form.Value, 'tcp_ports', _('TCP ports'));
		o.placeholder = '80, 443, 853, 465, 587, 993, 995';

		o = s.taboption('ports', form.Value, 'udp_ports', _('UDP ports'));
		o.placeholder = '80, 443, 853';

		o = s.taboption('ports', form.Flag, 'proxy_router_output', _('Proxy router output'));
		o.rmempty = false;

		o = s.taboption('bypass', form.TextValue, 'reserved_ipv4', _('Reserved IPv4'));
		o.rows = 8;
		o.wrap = 'off';
		o.placeholder = '0.0.0.0/8, 127.0.0.0/8, 172.16.0.0/12';

		o = s.taboption('bypass', form.TextValue, 'reserved_ipv6', _('Reserved IPv6'));
		o.rows = 10;
		o.wrap = 'off';
		o.placeholder = '::/128, ::1/128, fc00::/7, fe80::/10';

		s = m.section(form.TypedSection, 'tproxy', _('Logs'));
		s.anonymous = true;

		o = s.option(form.DummyValue, '_logs', _('Logs'));
		o.rawhtml = true;
		o.cfgvalue = function() {
			return '<pre style="white-space:pre-wrap;max-height:360px;overflow:auto;margin:0">' + htmlEscape(logs || _('No log entries.')) + '</pre>';
		};

		return m.render();
	},

	handleSaveApply: function(ev, mode) {
		return this.super('handleSaveApply', [ ev, mode ]).then(function() {
			return fs.exec('/etc/init.d/tproxy', [ 'restart' ]).catch(function(e) {
				ui.addNotification(null, E('p', _('Failed to restart tproxy service: %s').format(e.message)));
			});
		});
	}
});
