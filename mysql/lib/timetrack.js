var qs=require('querystring');
exports.sendHtml=function(html,resp){
	resp.setHeader('Content-Type','text/html,charset=GBK');
	resp.setHeader('Content-Length',Buffer.byteLength(html));
	resp.end(html);
};
exports.parseReciveData=function(req,cb){
	var body='';
	req.setEncoding('utf8');
	req.on('data',function(chunk){
		body+=chunk;
	});
	req.on('end',function(){
		cb(qs.parse(body));
	})
};
exports.actionForm=function(id,path,label){
	var html='<form method="POST" action="'+path+'">'+
	'<input type="hidden" name="id" value="'+id+'">'+
	'<input type="submit" value="'+label+'">'+
	'</form>';
	return html;
};
exports.add=function(db,req,resp){
	exports.parseReciveData(req,function(work){
		console.log(work.description);
		db.query(
		"INSERT INTO work(hours,date,description) "+
		"VALUES(?,?,?)",
		[work.hours,work.date,work.description],
		function(err){
			if(err) throw err;
			exports.show(db,resp);
		}
		);
	});
};
exports.delete=function(db,req,resp){
	exports.parseReciveData(req,function(work){
		db.query(
		"DELETE FROM work WHERE id=",
		[work.id],
		function(err){
			if(err) throw err;
			exports.show(db,resp);
		}
		);
	});
};
exports.archive=function(db,req,resp){
	exports.parseReciveData(req,function(work){
		db.query(
		"UPDATE work SET archived=1 WHERE id=?",
		[work.id],
		function(err){
			if(err) throw err;
			exports.show(db,resp);
		}
		);
	});
};
exports.show=function(db,resp,showArchived){
	var query="SELECT * FROM work "+
				"WHERE  archived=? "+
				"ORDER BY date DESC";
	var archiveValue=showArchived? 1: 0;
	db.query(query,[archiveValue],function(err,row){
		if(err) throw err;
		var html=showArchived ? "" :
			'<a href="/archived">Archived Work</a><br/>';
		html += exports.workHitListHtml(row);
		html += exports.workFormHtml();
		exports.sendHtml(html,resp);
	});
};
exports.showArchived=function(db,resp){
	exports.show(db,resp,true);
};
exports.workHitListHtml=function(row){
	var html='<table>';
	for(var i in row){
		html+='<tr>';
		html+='<td>'+row[i].date+'</td>';
		html+='<td>'+row[i].hours+'</td>';
		html+='<td>'+row[i].description+'</td>';
		if(!row[i].archived){
			html+='<td>'+exports.workArchiveForm(row[i].id)+'</td>';
		}
		html+='<td>'+exports.workDeleteForm(row[i].id)+'</td>';
		html+='</tr>';
	}
	html+='</table>';
	return html;
};
exports.workFormHtml=function(){
	var html='<form method="POST" action="/" accept-charset="utf-8">'+
	'<p>Date(YYYY-MM-DD):<br/><input name="date" type="text"/></p>'+
	'<p>Hour worked:<br/><input name="hours" type="text"/></p>'+
	'<p>Description:<br/>'+
	'<textarea name="description"></textarea></p>'+
	'<input type="submit" value="Add" />'+
	'</form>';
	return html;
};
exports.workArchiveForm=function(id){
	return exports.actionForm(id,'/archive','Archive');
};
exports.workDeleteForm=function(id){
	return exports.actionForm(id,'/delete','Delete');
};